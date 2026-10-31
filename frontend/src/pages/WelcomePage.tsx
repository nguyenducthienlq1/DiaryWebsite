export default function WelcomePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow">
                <h1 className="text-xl font-semibold text-center mb-6">Welcome to Personal Diary</h1>
                <p className="text-sm text-gray-500 text-center">This is the welcome page. You can navigate to the login page or the entry list page.</p>
                <div className="mt-6 flex justify-center space-x-4">
                    <a href="/login" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Go to Login
                    </a>
                </div>
            </div>
        </div>
    );
}   