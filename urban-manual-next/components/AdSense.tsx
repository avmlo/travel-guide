import { useEffect } from "react";

interface AdSenseProps {
  slot: string;
  format?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function AdSense({ 
  slot, 
  format = "auto", 
  responsive = true,
  style = {},
  className = ""
}: AdSenseProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          ...style
        }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your AdSense publisher ID
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

// Different ad formats for different placements

export function BannerAd({ className = "" }: { className?: string }) {
  return (
    <AdSense
      slot="1234567890" // Replace with your ad slot ID
      format="auto"
      responsive={true}
      className={className}
      style={{ minHeight: "90px" }}
    />
  );
}

export function SidebarAd({ className = "" }: { className?: string }) {
  return (
    <AdSense
      slot="0987654321" // Replace with your ad slot ID
      format="auto"
      responsive={true}
      className={className}
      style={{ minHeight: "250px" }}
    />
  );
}

export function InFeedAd({ className = "" }: { className?: string }) {
  return (
    <AdSense
      slot="1122334455" // Replace with your ad slot ID
      format="fluid"
      responsive={true}
      className={className}
      style={{ minHeight: "150px" }}
    />
  );
}

export function InArticleAd({ className = "" }: { className?: string }) {
  return (
    <AdSense
      slot="5544332211" // Replace with your ad slot ID
      format="fluid"
      responsive={true}
      className={className}
      style={{ minHeight: "200px" }}
    />
  );
}

