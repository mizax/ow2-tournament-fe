import type { BalancerInput, BalanceResult } from './types'

let wasmModule: typeof import('@/wasm/owbalancer/owbalancer.js') | null = null

async function getWasm() {
  if (!wasmModule) {
    const mod = await import('@/wasm/owbalancer/owbalancer.js')
    await mod.default()
    wasmModule = mod
  }
  return wasmModule
}

export function useBalancerWorker() {
  async function runBalance(input: BalancerInput): Promise<BalanceResult[]> {
    const wasm = await getWasm()
    const result = wasm.balance(
      input.players,
      input.range,
      input.lowRankLimiter,
      input.disallowSecondaryRoles,
      input.adjustSr,
      input.disableType,
      input.dispersionMinimizer,
      input.triesCount,
    )
    return Array.isArray(result) ? result : [result as BalanceResult]
  }

  return { runBalance }
}
