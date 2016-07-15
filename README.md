# ping-url

A very simple NodeJS app to ping url at an regular interval to reduce load time for a site. Ideally to be used from various parts of the world.

Actually if you are using CDN, someone hits the url of your site, edge servers in the closest zone configured for the location, loads the static content of the site.

Now-a-days static web hosting is a very popular trend. All the pages of site becomes static html pages, ideally rendered by popular engines, like Hugo, Octopress, Hexo, Jekyll etc. If you're using Cloudflare as the DNS manager, they have a on-the-fly CDN service, can be enabled for `A` recoreds for a site.

So, ping your site from corners of the world and get the edge servers of Cloudflare loads the content of your site in those locations/zone and actual users of your site gets your site loaded quite fast.

To reduce the cost of buying VPS's in various places, you can use NAT-VPS's. They comes at a very cheap price. Maybe $1/annum!!!
