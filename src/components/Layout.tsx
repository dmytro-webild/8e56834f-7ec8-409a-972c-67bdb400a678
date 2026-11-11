import { Outlet } from "react-router-dom";
import NavbarLoginTab from "@/components/navbars/NavbarLoginTab";
import FooterSubscribeWordmark from "@/components/sections/footer/FooterSubscribeWordmark";

export default function Layout() {
  return (
    <div className="relative isolate min-h-svh flex flex-col bg-background text-foreground" data-button="default" data-card="filled" data-pattern="none">
      <header data-webild-section="Header">
        <NavbarLoginTab
          brand="NextWave Web"
          navItems={[
            {
              name: "Work",
              href: "#services"
            },
            {
              name: "Pricing",
              href: "#pricing"
            },
            {
              name: "About",
              href: "#services"
            },
            {
              name: "Contact",
              href: "#contact"
            }
          ]}
          primaryButton={{
            text: "Get a Free Demo",
            href: "#contact"
          }}
          secondaryButton={{
            text: "Free Mockup",
            href: "#contact"
          }}
        />
      </header>
      <main className="flex-grow" data-button="default" data-card="filled" data-pattern="none">
        <Outlet />
      </main>
      <footer data-webild-section="Footer" data-section="footer">
        <FooterSubscribeWordmark
          brand="NextWave Web"
          description="Upgrading your business for the modern web. Agency-grade sites launched in 7 days without the $10,000 price tag."
          subscribe={{
            placeholder: "Enter your work email",
            button: "Get Free Concept"
          }}
          columns={[
            {
              title: "Navigation",
              links: [
                {
                  text: "Overview",
                  href: "#hero"
                },
                {
                  text: "Why NextWave",
                  href: "#services"
                },
                {
                  text: "Live Demos",
                  href: "#integrations"
                },
                {
                  text: "Pricing Options",
                  href: "#pricing"
                }
              ]
            },
            {
              title: "Company",
              links: [
                {
                  text: "About Founder",
                  href: "#contact"
                },
                {
                  text: "7-Day Process",
                  href: "#services"
                },
                {
                  text: "Growth Plan",
                  href: "#pricing"
                },
                {
                  text: "Contact Us",
                  href: "#contact"
                }
              ]
            },
            {
              title: "Services",
              links: [
                {
                  text: "Local Service Sites",
                  href: "#integrations"
                },
                {
                  text: "Medical & Dental",
                  href: "#integrations"
                },
                {
                  text: "Professional Firms",
                  href: "#integrations"
                },
                {
                  text: "Free Custom Mockup",
                  href: "#contact"
                }
              ]
            },
            {
              title: "Legal",
              links: [
                {
                  text: "Privacy Policy",
                  href: "#"
                },
                {
                  text: "Terms of Service",
                  href: "#"
                },
                {
                  text: "Ownership Terms",
                  href: "#pricing"
                }
              ]
            }
          ]}
          socials={[
            {
              text: "LinkedIn",
              href: "#"
            },
            {
              text: "X / Twitter",
              href: "#"
            },
            {
              text: "Instagram",
              href: "#"
            }
          ]}
          copyright="© 2026 NextWave Web. All rights reserved."
        />
      </footer>
    </div>
  );
}
