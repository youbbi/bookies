import treePng from '@/assets/tree-bookshelf.png'
import treePng2x from '@/assets/tree-bookshelf@2x.png'

export function TreeSvg() {
  return (
    <img
      src={treePng}
      srcSet={`${treePng} 1x, ${treePng2x} 2x`}
      alt=""
      aria-hidden="true"
      className="tree-bookshelf__tree"
      draggable={false}
    />
  )
}
