import {Breakpoint} from 'types/constEnums'
import getIsDrag from 'utils/retroGroup/getIsDrag'
import useBreakpoint from './useBreakpoint'
import {cacheCoveringBBox, ensureAllCovering} from './useControlBarCovers'
import useEventCallback from './useEventCallback'

const makeDrag = (ref: HTMLDivElement, lastX: number) => ({
  ref,
  lastX,
  minTranslation: 0,
  maxTranslation: 0,
  isDrag: false,
  translation: 0,
  width: 0
})

let drag: ReturnType<typeof makeDrag>

const noop = () => {}
const useDraggableFixture = () => {
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
  const onMouseUp = useEventCallback((e: MouseEvent | TouchEvent) => {
    if (e.type === 'touchend') {
      drag.ref.removeEventListener('touchmove', onMouseMove)
    } else {
      document.removeEventListener('mousemove', onMouseMove)
    }
  })

  const onMouseMove = useEventCallback((e: MouseEvent | TouchEvent) => {
    // required to prevent address bar scrolling & other strange browser things on mobile view
    e.preventDefault()
    const isTouchMove = e.type === 'touchmove'
    const {clientX} = isTouchMove ? (e as TouchEvent).touches[0] : (e as MouseEvent)
    const wasDrag = drag.isDrag
    if (!wasDrag) {
      drag.isDrag = getIsDrag(clientX, 0, drag.lastX, 0)
      if (!drag.isDrag) return
      const {left, right} = cacheCoveringBBox()
      const width = right - left
      drag.translation = -Math.round((window.innerWidth - left - right) / 2)
      const startingLeft = left - drag.translation
      const startingRight = left + width - drag.translation
      const PADDING = 8
      drag.minTranslation = -startingLeft + PADDING
      drag.maxTranslation = window.innerWidth - startingRight - PADDING
      drag.width = width

      const eventName = isTouchMove ? 'touchend' : 'mouseup'
      document.addEventListener(eventName, onMouseUp, {once: true})
    }
    const offsetX = clientX - drag.lastX
    drag.lastX = clientX
    drag.translation += offsetX
    drag.translation = Math.max(
      Math.min(drag.translation, drag.maxTranslation),
      drag.minTranslation
    )
    drag.ref.style.transform = `translateX(${drag.translation}px)`
    const left = window.innerWidth / 2 - 0.5 * drag.width + drag.translation
    const right = left + drag.width
    ensureAllCovering(left, right)
  })

  const onMouseDown = useEventCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      const isTouchStart = e.type === 'touchstart'
      if (isTouchStart) {
        e.target.addEventListener('touchmove', onMouseMove)
        e.target.addEventListener('touchend', onMouseUp)
      } else {
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
      }
      const {clientX} = isTouchStart
        ? (e as React.TouchEvent<HTMLDivElement>).touches[0]
        : (e as React.MouseEvent<HTMLDivElement>)
      drag = makeDrag(e.currentTarget as HTMLDivElement, clientX)
    }
  )
  const onClickCapture = useEventCallback((e) => {
    if (drag.isDrag) {
      e.stopPropagation()
    }
  })

  if (isDesktop) {
    return {onMouseDown, onClickCapture}
  }
  return {onMouseDown: noop, onClickCapture: noop}
}

export default useDraggableFixture
