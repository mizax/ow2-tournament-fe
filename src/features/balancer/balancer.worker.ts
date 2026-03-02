import * as Comlink from 'comlink'
import init, { balance, balance_half, balance_final } from '@/wasm/owbalancer/owbalancer.js'

export class WasmWorker {
  private initialized = false

  async loadWasm() {
    if (!this.initialized) {
      await init()
      this.initialized = true
    }
  }

  async fullBalance(data: string): Promise<unknown> {
    await this.loadWasm()
    const {
      players,
      range,
      lowRankLimiter,
      disallowSecondaryRoles,
      adjustSr,
      disableType,
      dispersionMinimizer,
      triesCount,
    } = JSON.parse(data)
    return balance(
      players,
      range,
      lowRankLimiter,
      disallowSecondaryRoles,
      adjustSr,
      disableType,
      dispersionMinimizer,
      triesCount,
    )
  }

  async halfBalance(data: string): Promise<unknown> {
    await this.loadWasm()
    const { players, range, lowRankLimiter, disallowSecondaryRoles, adjustSr } = JSON.parse(data)
    return balance_half(players, range, lowRankLimiter, disallowSecondaryRoles, adjustSr)
  }

  async finalBalance(data: string): Promise<unknown> {
    await this.loadWasm()
    const { players, range, lowRankLimiter, disallowSecondaryRoles, adjustSr } = JSON.parse(data)
    return balance_final(players, range, lowRankLimiter, disallowSecondaryRoles, adjustSr)
  }
}

Comlink.expose(new WasmWorker())
