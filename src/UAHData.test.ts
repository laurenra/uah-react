import { describe, expect, it } from 'vitest'
import { UAHData } from './UAHData'

describe('UAHData.parseFile', () => {
  it('parses monthly rows and trend row', () => {
    const text = [
      'Year Mo Globe Land Ocean NH Land Ocean SH Land Ocean',
      '1978 12 -0.48 -0.52 -0.46 -0.44 -0.47 -0.42 -0.52 -0.62 -0.49',
      '1979  1 -0.47 -0.64 -0.41 -0.64 -0.86 -0.50 -0.31 -0.13 -0.34',
      'Trend    0.16  0.22  0.13  0.19  0.23  0.16  0.13  0.19  0.11',
    ].join('\n')

    const parsed = UAHData.parseFile(text)

    expect(parsed.columns).toEqual([
      'Globe',
      'Globe_Land',
      'Globe_Ocean',
      'NH',
      'NH_Land',
      'NH_Ocean',
      'SH',
      'SH_Land',
      'SH_Ocean',
    ])
    expect(parsed.monthly).toHaveLength(2)
    expect(parsed.monthly[0]).toMatchObject({
      year: 1978,
      month: 12,
    })
    expect(parsed.monthly[0].values.Globe).toBeCloseTo(-0.48)
    expect(parsed.monthly[1].values.SH).toBeCloseTo(-0.31)
    expect(parsed.trend?.values.Globe).toBeCloseTo(0.16)
  })
})
