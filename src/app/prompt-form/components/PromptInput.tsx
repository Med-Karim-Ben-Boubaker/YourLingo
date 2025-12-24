interface PromptInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
}

export function PromptInput({ value, onChange, disabled }: PromptInputProps) {
    return (
        <div>
            <label htmlFor="prompt">Prompt</label>
            <br />
            <textarea
                id="prompt"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={6}
                cols={60}
                placeholder="E.g. I want to learn a cafe conversation including: kaffee, tschuss, bitte, ich mochte"
                disabled={disabled}
            />
        </div>
    );
}
