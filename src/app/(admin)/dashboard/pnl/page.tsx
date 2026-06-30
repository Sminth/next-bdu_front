"use client";

export default function PnlPage() {
    return (
        <div className="w-full h-[calc(100vh-7rem)]">
            <iframe
                title="Dashboard PnL"
                width="100%"
                height="100%"
                src="https://app.powerbi.com/reportEmbed?reportId=69980fcc-1ccc-4f67-9b52-cca98ce09b1c&autoAuth=true&ctid=db1a8819-d5d8-40fc-87f2-90f8240f3a40"
                frameBorder="0"
                allowFullScreen
            />
        </div>
    );
}
