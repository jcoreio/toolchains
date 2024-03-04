import * as React from 'react'
import { describe, it } from 'mocha'
import { render, cleanup } from '@testing-library/react'
import { expect } from 'chai'
import sinon from 'sinon'

import ViewSlider from '../src'

let clock: sinon.SinonFakeTimers
beforeEach(() => {
  clock = sinon.useFakeTimers()
})
afterEach(() => {
  cleanup()
  clock.restore()
})

describe('ViewSlider', () => {
  it('single transition works', async () => {
    const renderView = ({ index }: { index: number }) => (
      <div>Child {index}</div>
    )

    const { container, rerender } = render(
      <ViewSlider numViews={3} renderView={renderView} activeView={0} />
    )

    expect(container.textContent).to.equal('Child 0')

    rerender(<ViewSlider numViews={3} renderView={renderView} activeView={1} />)

    expect(container.textContent).to.equal('Child 0Child 1Child 2')
    await clock.tickAsync(1000)
    expect(container.textContent).to.equal('Child 1')
  })
})
