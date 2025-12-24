import Link from "next/link";

export default function RootPage() {
    return (
        <main>
            <h1>Welcome to YourLingo</h1>
            <p>Create personalized language lessons</p>
            <Link href="/prompt-form">
                <button>Create a lesson</button>
            </Link>
        </main>
    );
}
