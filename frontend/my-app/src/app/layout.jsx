import './globals.css';

export const metadata = {
    title: 'Student Portal - College Platform',
    description: 'Your complete student portal for courses, payments, results, and more.',
    keywords: ['college', 'university', 'students', 'portal', 'education', 'courses'],
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
                <meta name="theme-color" content="#7C3AED" />
            </head>
            <body className="antialiased">{children}</body>
        </html>
    );
}
