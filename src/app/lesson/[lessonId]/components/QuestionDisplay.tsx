import { ListenButton } from "./ListenButton";

export function QuestionDisplay({ questionText, lang }: { questionText: string; lang?: string }) {
    return (
        <div>
            <p>{questionText}</p>
            <ListenButton text={questionText} lang={lang} />
        </div>
    );
}
