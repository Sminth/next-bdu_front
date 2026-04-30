"use client";

export default function ComptabilitePage() {
    return (
        <div className="w-full h-[calc(100vh-7rem)]">
            <iframe
                title="Dashboard Project Engagement"
                width="100%"
                height="100%"
                src="https://app.powerbi.com/reportEmbed?reportId=ef220d50-7bf1-498d-8730-a6bc8da05e70&autoAuth=true&ctid=db1a8819-d5d8-40fc-87f2-90f8240f3a40"
                frameBorder="0"
                allowFullScreen
            />
        </div>
    );
}
