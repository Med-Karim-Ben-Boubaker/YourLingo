export function TokenBank({
    tokens,
    usedTokenIndexes,
    locked,
    onSelectToken
}: {
    tokens: string[];
    usedTokenIndexes: Set<number>;
    locked: boolean;
    onSelectToken: (token: string, index: number) => void;
}) {
    return (
        <div>
            <div>
                {tokens.map((token, idx) => {
                    const disabled = usedTokenIndexes.has(idx) || locked;
                    return (
                        <button
                            key={String(idx)}
                            onClick={() => onSelectToken(token, idx)}
                            disabled={disabled}
                            aria-pressed={disabled}
                        >
                            {token}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
