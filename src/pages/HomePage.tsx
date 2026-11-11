import HeroFluidDashboard from "@/components/sections/hero/HeroFluidDashboard";
import FeaturesFluidUseCases from "@/components/sections/features/FeaturesFluidUseCases";
import IntegrationsTileGrid from "@/components/sections/features/IntegrationsTileGrid";
import PricingFluidPlans from "@/components/sections/pricing/PricingFluidPlans";
import ContactFluidForm from "@/components/sections/contact/ContactFluidForm";

export default function HomePage() {
  return (
    <>
      <div id="hero" data-webild-section="HeroFluidDashboard" data-webild-section-id="HeroFluidDashboard-1" data-section="hero">
        <HeroFluidDashboard
          tag="Next-Generation Web Agency"
          title="Agency-Grade Websites Without the High Price"
          mutedTitle="or 3-Month Wait."
          description="Upgrading your business for the modern web. We launch fast, mobile-first websites that win clients in just 7 days."
          primaryButton={{
            text: "Free Custom Mockup",
            href: "#contact"
          }}
          secondaryButton={{
            text: "Explore Services",
            href: "#services"
          }}
          variant="overview"
          dashboard={{
            appName: "NextWave",
            menuLabel: "Menu",
            navItems: [
              {
                label: "Overview",
                icon: "overview"
              },
              {
                label: "Projects",
                icon: "folder"
              },
              {
                label: "Performance",
                icon: "chart"
              },
              {
                label: "Clients",
                icon: "users"
              },
              {
                label: "Deliveries",
                icon: "tasks"
              }
            ],
            activeIndex: 0,
            generalLabel: "Support",
            generalItems: [
              {
                label: "Settings",
                icon: "settings"
              },
              {
                label: "Help Center",
                icon: "help"
              }
            ],
            pageTitle: "Launch Hub",
            greeting: "7-Day Delivery Tracker",
            subline: "Real-time build progress and site launch speed.",
            stats: [
              {
                label: "Average Launch",
                value: "7 Days",
                delta: "100%",
                points: [
                  1,
                  2,
                  4,
                  5,
                  6,
                  7,
                  7
                ]
              },
              {
                label: "Lead Increase",
                value: "+148%",
                delta: "+32%",
                points: [
                  3,
                  5,
                  6,
                  9,
                  11,
                  14,
                  18
                ]
              }
            ],
            chart: {
              title: "Traffic Growth",
              legend: [
                "Visitors",
                "Target"
              ],
              bars: [
                {
                  label: "Day1",
                  value: 1200,
                  target: 3000
                },
                {
                  label: "Day3",
                  value: 2800,
                  target: 4000
                },
                {
                  label: "Day5",
                  value: 4500,
                  target: 5000
                },
                {
                  label: "Day7",
                  value: 6800,
                  target: 6000
                }
              ]
            },
            table: {
              title: "Recent Projects",
              columns: [
                "Client",
                "Status"
              ],
              rows: [
                {
                  title: "Apex Medical Group",
                  meta: "Medical Site",
                  value: "Launched"
                },
                {
                  title: "Vanguard Legal Firm",
                  meta: "Professional",
                  value: "Launched"
                },
                {
                  title: "Summit HVAC Solutions",
                  meta: "Local Service",
                  value: "In Progress"
                }
              ]
            },
            promo: {
              title: "7-Day Site Launch",
              text: "Get a high-converting website fast.",
              progress: 0.9,
              button: {
                text: "Get Started",
                href: "#contact"
              }
            }
          }}
          introDelay={0.2}
        />
      </div>

      <div id="services" data-webild-section="FeaturesFluidUseCases" data-webild-section-id="FeaturesFluidUseCases-1" data-section="services">
        <FeaturesFluidUseCases
          label="Why NextWave"
          variant="status"
          title="Traditional agency speed vs modern AI delivery"
          mutedTitle="modern AI delivery"
          description="Stop paying for agency overhead and endless revisions. Get a custom, conversion-focused website ready in seven days."
          items={[
            {
              title: "Traditional Model",
              heading: "Overpriced agencies with slow 3-month turnarounds",
              description: "Legacy web design agencies charge over $10,000 for slow builds bloated with unnecessary project management overhead.",
              points: [
                "Costs upwards of $10,000 upfront",
                "Takes 3 to 6 months",
                "Endless revision delays"
              ],
              panel: {
                variant: "timeline",
                icon: "calendar",
                title: "Agency Timeline",
                meta: "90 Day Average",
                steps: [
                  {
                    name: "Kickoff & discovery",
                    time: "Month 1",
                    done: true
                  },
                  {
                    name: "Wireframe revisions",
                    time: "Month 2",
                    done: true
                  },
                  {
                    name: "Development phase",
                    time: "Month 3"
                  },
                  {
                    name: "Final review launch",
                    time: "Month 4"
                  }
                ],
                action: "View delays"
              }
            },
            {
              title: "NextWave Launch",
              heading: "Agency quality delivered in seven days flat",
              description: "We leverage modern AI workflows to engineer bespoke, mobile-first websites in just 7 days for $4,000 or $400/mo.",
              points: [
                "7-day total turnaround time",
                "$4,000 flat or $400/month",
                "Built-in lead capture systems"
              ],
              panel: {
                variant: "timeline",
                icon: "rocket",
                title: "NextWave Sprint",
                meta: "7 Days Total",
                steps: [
                  {
                    name: "Concept mockup delivered",
                    time: "Day 1",
                    done: true
                  },
                  {
                    name: "Content & copy polish",
                    time: "Day 3",
                    done: true
                  },
                  {
                    name: "Mobile & SEO setup",
                    time: "Day 5",
                    done: true
                  },
                  {
                    name: "Live site deployment",
                    time: "Day 7",
                    done: true
                  }
                ],
                action: "Launch site"
              }
            },
            {
              title: "Lead Capture",
              heading: "Turn website visitors into high-paying clients fast",
              description: "Every NextWave site is optimized from day one to capture lead details and convert traffic into actual revenue.",
              points: [
                "Clear conversion pathways",
                "Mobile-first responsive layouts",
                "High-impact agency typography"
              ],
              panel: {
                variant: "metrics",
                icon: "chart",
                title: "Client Growth",
                meta: "First 30 days",
                stats: [
                  {
                    label: "Conversion rate",
                    value: "4.8%",
                    delta: "+140%"
                  },
                  {
                    label: "Qualified leads",
                    value: "42",
                    delta: "+18 this mo"
                  }
                ],
                chart: [
                  12,
                  19,
                  24,
                  31,
                  38,
                  45,
                  52
                ],
                chartType: "bars",
                action: "See metrics"
              }
            },
            {
              title: "Full Ownership",
              heading: "Zero lock-in with 100% code ownership guaranteed",
              description: "Choose full ownership for $4,000 one-time or our hassle-free $400/mo Growth Plan with hosting and maintenance included.",
              points: [
                "Full website asset ownership",
                "Zero surprise developer fees",
                "Unlimited minor content edits"
              ],
              panel: {
                variant: "status",
                icon: "file",
                title: "Project Terms",
                meta: "Clear Pricing",
                rows: [
                  {
                    name: "Full Ownership",
                    status: "$4,000 flat",
                    tone: "done"
                  },
                  {
                    name: "Growth Plan",
                    status: "$400/month",
                    tone: "done"
                  },
                  {
                    name: "Turnaround Time",
                    status: "7 Days",
                    tone: "done"
                  }
                ],
                note: "No hidden agency fees or unexpected monthly billing.",
                action: "Choose plan"
              }
            }
          ]}
        />
      </div>

      <div id="integrations" data-webild-section="IntegrationsTileGrid" data-webild-section-id="IntegrationsTileGrid-1" data-section="integrations">
        <IntegrationsTileGrid
          label="Ecosystem Sync"
          title="Connected to your essential business growth tools."
          mutedTitle="growth tools."
          description="Every website we build connects with your CRM, analytics, and marketing tools to capture and turn leads into clients automatically."
          button={{
            text: "Claim Free Mockup",
            href: "#contact"
          }}
          items={[
            {
              name: "Google Analytics",
              category: "Analytics",
              icon: "BarChart"
            },
            {
              name: "HubSpot CRM",
              category: "Lead Management",
              icon: "Users"
            },
            {
              name: "Calendly",
              category: "Booking",
              icon: "Calendar"
            },
            {
              name: "Stripe",
              category: "Payments",
              icon: "CreditCard"
            },
            {
              name: "Mailchimp",
              category: "Email Marketing",
              icon: "Mail"
            },
            {
              name: "Zapier",
              category: "Automations",
              icon: "Zap"
            },
            {
              name: "Google Maps",
              category: "Local SEO",
              icon: "MapPin"
            },
            {
              name: "Cloudflare",
              category: "Security",
              icon: "Shield"
            },
            {
              name: "ActiveCampaign",
              category: "Marketing",
              icon: "Send"
            },
            {
              name: "Make",
              category: "Workflows",
              icon: "Layers"
            },
            {
              name: "Typeform",
              category: "Form Capture",
              icon: "FileText"
            },
            {
              name: "Google Search",
              category: "SEO Insights",
              icon: "Search"
            }
          ]}
        />
      </div>

      <div id="pricing" data-webild-section="PricingFluidPlans" data-webild-section-id="PricingFluidPlans-1" data-section="pricing">
        <PricingFluidPlans
          label="Pricing"
          title="Two clear paths to a top-tier digital storefront"
          mutedTitle="digital storefront"
          description="Select full ownership upfront or choose zero upfront cost with managed monthly updates."
          items={[
            {
              name: "Full Ownership",
              price: "$4,000",
              period: "One-Time",
              description: "Complete website ownership delivered and launched in one week.",
              features: [
                "Custom 5–7 page website",
                "Conversion copywriting",
                "Mobile & SEO optimization",
                "7-day fast launch",
                "100% full site ownership"
              ],
              button: {
                text: "Get Custom Mockup",
                href: "#contact"
              }
            },
            {
              name: "Growth Plan",
              price: "$400",
              period: "/month",
              description: "Zero upfront cost with ongoing managed support and edits.",
              features: [
                "$0 upfront investment",
                "Custom website build",
                "Managed hosting & security",
                "Unlimited minor edits",
                "Built-in lead capture"
              ],
              button: {
                text: "Start Growth Plan",
                href: "#contact"
              }
            }
          ]}
        />
      </div>

      <div id="contact" data-webild-section="ContactFluidForm" data-webild-section-id="ContactFluidForm-1" data-section="contact">
        <ContactFluidForm
          tag="Free Mockup"
          title="See your site before paying."
          mutedTitle="before paying."
          nameLabel="Full name"
          emailLabel="Email address"
          companyLabel="Website URL"
          messageLabel="Project details"
          submitText="Send Free Concept"
          variant="status"
          avatars={[
            {
              imageSrc: "https://img.b2bpic.net/free-photo/young-millennial-student-searches-information-homework-writes-down-necessary-content-textbook-prepare-project-it-topic_273609-38712.jpg",
              imageAlt: "Young millennial student searches information for homework, writes down necessary content in textbook, prepare project on IT topic",
              initials: "RR"
            },
            {
              imageSrc: "https://img.b2bpic.net/free-photo/businessman-with-glasses-arms-folded_1098-44.jpg",
              imageAlt: "businessman with glasses and arms folded",
              initials: "MV"
            },
            {
              imageSrc: "https://img.b2bpic.net/free-photo/image-beautiful-young-woman-sitting-while-holding-digital-tablet-her-hands-business-owner-cafeteria-restaurant_158595-7587.jpg",
              imageAlt: "Image of beautiful young woman sitting while holding a digital tablet in her hands. Business owner, cafeteria, restaurant",
              initials: "ER"
            }
          ]}
          note="Replies in under 2 hours"
        />
      </div>
    </>
  );
}
