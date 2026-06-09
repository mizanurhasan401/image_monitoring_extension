import { beforeEach, describe, expect, it } from 'vitest'
import { useImageStore } from '@/store/imageStore'

describe('imageStore selection', () => {
  beforeEach(() => {
    useImageStore.setState({
      selectedIds: [],
      images: [],
    })
  })

  it('toggleSelect adds and removes ids', () => {
    const { toggleSelect } = useImageStore.getState()

    toggleSelect('a')
    expect(useImageStore.getState().selectedIds).toEqual(['a'])

    toggleSelect('b')
    expect(useImageStore.getState().selectedIds).toEqual(['a', 'b'])

    toggleSelect('a')
    expect(useImageStore.getState().selectedIds).toEqual(['b'])
  })

  it('selectAll and clearSelection replace selection', () => {
    const { selectAll, clearSelection } = useImageStore.getState()

    selectAll(['x', 'y', 'z'])
    expect(useImageStore.getState().selectedIds).toEqual(['x', 'y', 'z'])

    clearSelection()
    expect(useImageStore.getState().selectedIds).toEqual([])
  })

  it('selectRange merges ids into selection', () => {
    const { selectRange, toggleSelect } = useImageStore.getState()
    toggleSelect('a')
    selectRange(['b', 'c'])
    expect([...useImageStore.getState().selectedIds].sort()).toEqual(['a', 'b', 'c'])
  })

  it('removeImage drops id from selection', () => {
    const { removeImage, selectAll } = useImageStore.getState()

    useImageStore.setState({
      images: [
        {
          id: 'img-1',
          url: 'https://example.com/a.png',
          filename: 'a.png',
          extension: 'png',
          sourceType: 'img',
          discoveredAt: 1,
          pageUrl: 'https://example.com',
        },
      ],
    })

    selectAll(['img-1'])
    removeImage('img-1')

    expect(useImageStore.getState().selectedIds).toEqual([])
  })
})
