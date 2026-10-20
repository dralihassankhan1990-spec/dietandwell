import useScrollDepth from '../../hooks/useScrollDepth.js';
import './DepthBackdrop.css';

export default function DepthBackdrop({ image = '/images/blog-hero.jpg', botanical = true, overlay }) {
  const ref = useScrollDepth();
  return <div className="depth-backdrop" ref={ref} aria-hidden="true">
    <div className="depth-backdrop-photo" style={{ backgroundImage: `url("${image}")` }} />
    <div className="depth-backdrop-shade" style={overlay ? { backgroundColor: overlay } : undefined} />
    {botanical && <div className="depth-botanical"><i/><i/><i/><span/></div>}
  </div>;
}
