"use client";

export default function ReportingPage() {
    return (
        <div className="w-full h-[calc(100vh-7rem)]">
            <iframe
                title="Dashboard Project Inverst"
                width="100%"
                height="100%"
                src="https://app.powerbi.com/reportEmbed?reportId=a1b37022-2843-454f-bda8-05fac817204e&autoAuth=true&ctid=db1a8819-d5d8-40fc-87f2-90f8240f3a40&actionBarEnabled=true"
                frameBorder="0"
                allowFullScreen
            />
        </div>
    );
}
