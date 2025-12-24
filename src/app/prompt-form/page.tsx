import PromptForm from "./components/PromptForm";
import { PageHeader } from "./components/PageHeader";

export default function PromptFormPage() {
    return (
        <main>
            <PageHeader />
            <p>What do you want to learn about?</p>
            <PromptForm />
        </main>
    );
}
