import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './nutrition-scene.css';

export default function NutritionStillLife() {
  const mountRef = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const mount = mountRef.current;
    const track = mount.closest('[data-nutrition-track]') || mount;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const resources = new Set();
    let renderer, observer, resizeObserver, frame = 0, visible = false, disposed = false, progress = 0, target = 0;
    const keep = r => { resources.add(r); return r; };
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 60);
    camera.position.set(0, 5.6, 8.8); camera.lookAt(0, .3, 0);
    const group = new THREE.Group(); scene.add(group);
    const material = color => keep(new THREE.MeshStandardMaterial({ color, roughness: .48 }));
    const cream = material('#f2ecda'), rind = material('#e69a24'), pith = material('#fff1c4'), orange = material('#f7b332');
    const skin = material('#365b29'), flesh = material('#c7dc72'), pit = material('#8a4f2c'), green = material('#408747');
    green.side = THREE.DoubleSide;
    const veinMat = material('#98b95b'), blue = material('#394e83'), crownMat = material('#6875a1');
    const mesh = (geo, mat, parent = group) => { const obj = new THREE.Mesh(keep(geo), mat); parent.add(obj); return obj; };
    const ingredients = [];
    const place = (obj, x, y, z, spread) => { obj.position.set(x,y,z); ingredients.push({obj, base:obj.position.clone(), spread}); };
    const plate = mesh(new THREE.CylinderGeometry(2.45, 2.18, .16, 80), cream); plate.position.y = -.5;
    const rim = mesh(new THREE.TorusGeometry(2.32,.12,12,96),cream); rim.rotation.x = Math.PI/2; rim.position.y = -.39;
    const foot = mesh(new THREE.CylinderGeometry(1.45,1.5,.2,48),cream); foot.position.y = -.65;
    // Radial citrus segments, pith and rind are individually modelled.
    for (let i=0;i<2;i++) {
      const fruit = new THREE.Group(); group.add(fruit);
      mesh(new THREE.CylinderGeometry(.82,.82,.16,64),rind,fruit);
      mesh(new THREE.CylinderGeometry(.75,.75,.18,64),pith,fruit);
      for(let j=0;j<10;j++) {
        const segment = mesh(new THREE.CircleGeometry(.68,12,j*Math.PI/5+.045,Math.PI/5-.09),orange,fruit);
        segment.rotation.x=-Math.PI/2; segment.position.y=.095;
      }
      fruit.scale.setScalar(i ? .84 : 1); fruit.rotation.x=i ? .32 : .13;
      place(fruit,1.05,i ? .55 : .05,i ? -.7 : .65,.9);
    }
    const avocado = new THREE.Group(); group.add(avocado);
    const shell=mesh(new THREE.SphereGeometry(1,40,24),skin,avocado); shell.scale.set(.69,.23,1.02);
    const cut=mesh(new THREE.SphereGeometry(1,40,24),flesh,avocado); cut.scale.set(.62,.105,.94); cut.position.y=.17;
    const stone=mesh(new THREE.SphereGeometry(.35,32,24),pit,avocado); stone.position.set(0,.29,.2); stone.scale.y=.8;
    avocado.rotation.y=-.5; place(avocado,-.6,.05,.62,.5);
    for(let i=0;i<9;i++) {
      const leaf=new THREE.Group(); group.add(leaf);
      const shape=new THREE.Shape(); shape.moveTo(0,-.55); shape.bezierCurveTo(-.48,-.05,-.3,.5,0,.74); shape.bezierCurveTo(.37,.35,.48,-.2,0,-.55);
      const geo=new THREE.ShapeGeometry(shape,12), pos=geo.attributes.position;
      for(let n=0;n<pos.count;n++) pos.setZ(n,.15*Math.sin((pos.getY(n)+.55)*2.4));
      geo.computeVertexNormals(); mesh(geo,green,leaf).rotation.x=-Math.PI/2;
      const vein=mesh(new THREE.CylinderGeometry(.012,.018,1.1,5),veinMat,leaf); vein.rotation.x=Math.PI/2; vein.position.y=.08;
      const a=i*2.399; leaf.rotation.y=a;
      place(leaf,Math.cos(a)*(i<5?1.5:2.35),.03+i*.075,Math.sin(a)*1.3-.2,i<5?.45:1.5);
    }
    for(let i=0;i<17;i++) {
      const berry=new THREE.Group(); group.add(berry);
      mesh(new THREE.SphereGeometry(.15,16,12),blue,berry);
      const crown=mesh(new THREE.TorusGeometry(.047,.016,5,5),crownMat,berry); crown.rotation.x=Math.PI/2; crown.position.y=.145;
      const a=i*2.399; place(berry,-.85+Math.cos(a)*.62,.12+(i%3)*.15,-.8+Math.sin(a)*.52,.65+i%3*.25);
    }
    scene.add(new THREE.HemisphereLight('#fff7df','#54755b',2.5));
    const key=new THREE.DirectionalLight('#fff7df',3.5); key.position.set(3,7,5); scene.add(key);
    const fill=new THREE.DirectionalLight('#d8eebf',1.6); fill.position.set(-4,2,-3); scene.add(fill);
    const render=()=>{
      frame=0; if(disposed||!visible||document.hidden) return;
      progress+=(target-progress)*.075;
      group.rotation.y=-.25+progress*.95; group.rotation.z=-.035+progress*.07;
      ingredients.forEach(({obj,base,spread},i)=>{obj.position.copy(base);obj.position.y+=progress*spread*1.3;obj.position.x+=base.x*progress*.1;obj.rotation.z=Math.sin(i*2.4)*progress*.18;});
      renderer.render(scene,camera);
      if(Math.abs(target-progress)>.0005) frame=requestAnimationFrame(render);
    };
    const start=()=>{if(renderer&&visible&&!frame&&!disposed) frame=requestAnimationFrame(render);};
    const update=()=>{const r=track.getBoundingClientRect();target=motion.matches?0:THREE.MathUtils.clamp(-r.top/Math.max(1,r.height-innerHeight),0,1);start();};
    const resize=()=>{const {width,height}=mount.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();start();};
    const lost=()=>setReady(false);
    try {
      renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
      renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
      mount.appendChild(renderer.domElement);renderer.domElement.addEventListener('webglcontextlost',lost);
      resizeObserver=new ResizeObserver(resize);resizeObserver.observe(mount);
      observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)update();else{cancelAnimationFrame(frame);frame=0;}});observer.observe(mount);
      window.addEventListener('scroll',update,{passive:true});document.addEventListener('visibilitychange',start);motion.addEventListener('change',update);
      resize();setReady(true);
    } catch {setReady(false);}
    return ()=>{disposed=true;cancelAnimationFrame(frame);observer?.disconnect();resizeObserver?.disconnect();window.removeEventListener('scroll',update);document.removeEventListener('visibilitychange',start);motion.removeEventListener('change',update);resources.forEach(r=>r.dispose());renderer?.domElement.removeEventListener('webglcontextlost',lost);renderer?.dispose();renderer?.domElement.remove();};
  },[]);
  return <div className={`nutrition-scene ${ready?'is-ready':''}`} aria-hidden="true"><div className="nutrition-scene-halo"/><img className="nutrition-scene-fallback" src="/images/blog-hero.jpg" alt=""/><div className="nutrition-scene-mount" ref={mountRef}/><div className="nutrition-scene-shadow"/><span className="nutrition-scene-caption">WHOLE FOODS · EVERYDAY WELLNESS</span></div>;
}
