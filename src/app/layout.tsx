import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "YourLingo - Custom Language Learning",
    description: "Create personalized language lessons",
};

export default function RootLayout({
    children,
}: Readonly<{
        children: React.ReactNode;
    }>) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}
