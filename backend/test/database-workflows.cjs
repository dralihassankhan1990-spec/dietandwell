// All test records stay inside a transaction which is always rolled back.
require('reflect-metadata');
const assert = require('node:assert/strict');
const { AppDataSource } = require('../dist/data-source');
const { BlogService } = require('../dist/blog/blog.service');
const { ContactService } = require('../dist/contact/contact.service');
const { BlogPost, Category, Tag, User, ContactInquiry } = require('../dist/entities');
(async () => {
  await AppDataSource.initialize();
  const runner = AppDataSource.createQueryRunner();
  await runner.connect(); await runner.startTransaction();
  try {
    const repo = entity => runner.manager.getRepository(entity);
    const author = await repo(User).findOne({where:{email:'admin@dietandwell.com'}});
    assert.ok(author, 'Existing local admin required');
    const blogs = new BlogService(repo(BlogPost), repo(Category), repo(Tag));
    const post = await blogs.create({title:'Isolated regression check',content:'<p>Test article</p>',published:false,tags:[],categories:[]}, author);
    assert.ok(post.id);
    const updated = await blogs.update(post.id,{title:'Updated regression check',content:'<p>Updated</p>',coverImage:'',featuredImage:''});
    assert.equal(updated.title,'Updated regression check');
    assert.equal((await repo(BlogPost).findOneBy({id:post.id})).content,'<p>Updated</p>');
    await blogs.remove(post.id);
    assert.equal(await repo(BlogPost).findOneBy({id:post.id}),null);
    const contacts = new ContactService(repo(ContactInquiry),{get:()=>undefined});
    const inquiry = await contacts.create({name:'Isolated test',email:'qa@example.invalid',message:'Database transaction verification'});
    assert.ok(inquiry.id);
    assert.equal((await contacts.markAsRead(inquiry.id)).status,'read');
    assert.equal((await repo(ContactInquiry).findOneBy({id:inquiry.id})).message,'Database transaction verification');
    console.log('PASS: blog create/read/update/delete and contact save/read; all test records rolled back. No email sent.');
  } finally { await runner.rollbackTransaction(); await runner.release(); await AppDataSource.destroy(); }
})().catch(error=>{console.error(error.message);process.exitCode=1;});
