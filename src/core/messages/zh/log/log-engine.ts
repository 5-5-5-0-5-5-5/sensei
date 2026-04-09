// SPDX-License-Identifier: MIT
/**
 * Re-exports the log engine from pt/ since the engine logic is identical.
 * Translation happens via LogMensagens which is locale-specific.
 */

export { logEngine, LogEngineAdaptativo } from '../../pt/log/log-engine.js';
