import { Request, Response, NextFunction } from 'express';

// Single-instance baseline. Use a shared rate-limit store before horizontal scaling.
export function httpProtection() {
  const buckets=new Map<string,{count:number;until:number}>();
  const cleanup=setInterval(()=>{const now=Date.now();for(const [key,value] of buckets)if(value.until<=now)buckets.delete(key);},60000);
  cleanup.unref();
  return (req:Request,res:Response,next:NextFunction)=>{
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
    const route=req.path;
    const sensitive=/^\/api\/(auth\/(login|register|refresh)|contact|upload|diet-plan-studio)/.test(route) && req.method!=='GET';
    if (!sensitive) return next();
    res.setHeader('Cache-Control','no-store');
    const now=Date.now(), key=`${req.ip}:${route.split('/').slice(0,4).join('/')}`;
    let bucket=buckets.get(key);
    if(!bucket || bucket.until<=now){if(buckets.size>=10000){res.status(429).json({message:'Server busy. Please retry shortly.'});return;}bucket={count:0,until:now+60000};buckets.set(key,bucket);}
    bucket.count++;
    const limit=route.includes('diet-plan-studio')?6:route.includes('/upload')?20:10;
    if(bucket.count>limit){res.setHeader('Retry-After',Math.ceil((bucket.until-now)/1000));res.status(429).json({message:'Too many requests. Please wait a minute and try again.'});return;}
    next();
  };
}
