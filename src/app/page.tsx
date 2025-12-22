import PromptForm from "./components/PromptForm";

export default function RootPage() {
    return (
        <main>
            <header>
                <h1>Welcome to YourLingo</h1>
            </header>
            <p>What do you want to learn about?</p>
            <PromptForm />
        </main>
    );
}