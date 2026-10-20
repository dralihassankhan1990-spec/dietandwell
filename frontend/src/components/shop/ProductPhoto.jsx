import './product-photo.css';
const CELLS={quinoa:0,'pumpkin-seeds':1,almonds:2,flaxseed:3,'chia-seeds':4,'whey-protein':5,'rolled-oats':6};
export default function ProductPhoto({product,category=false}){
 const index=category?(product.slug==='digital-books'?7:product.slug==='superfoods-seeds'?1:8):(CELLS[product.slug]??(product.type==='digital'?7:8));
 return <div className={`product-photo ${category?'product-photo--category':''}`} role="img" aria-label={`${product.name} — representative product imagery`}>
   <div className="product-photo-crop" style={{backgroundPosition:`${(index%3)*50}% ${Math.floor(index/3)*50}%`}}/>
   {!category&&<><span className="product-photo-disclosure">Illustrative image</span>{product.type==='digital'&&<span className="product-photo-book-title">{product.name}</span>}</>}
 </div>;
}
