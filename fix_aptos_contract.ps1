$content = @"
/**
 * COMPATIBILITY FILE - Re-exports Base contract hooks
 * This maintains backward compatibility with existing imports
 * All functionality now uses wagmi for Base blockchain
 */

export * from './useBaseContract';
"@

Set-Content "src\hooks\useAptosContract.ts" $content -NoNewline
Write-Host "✅ Fixed useAptosContract.ts" -ForegroundColor Green
