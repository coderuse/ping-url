# ping-url

A very simple NodeJS app to ping url at an regular interval to reduce load time for a site. Ideally to be used from various parts of the world.

Actually if you are using CDN, someone hits the url of your site, edge servers in the closest zone configured for the location, loads the static content of the site.

Now-a-days static web hosting is a very popular trend. All the pages of site becomes static html pages, ideally rendered by popular engines, like Hugo, Octopress, Hexo, Jekyll etc. If you're using Cloudflare as the DNS manager, they have a on-the-fly CDN service, can be enabled for `A` recoreds for a site.

So, ping your site from corners of the world and get the edge servers of Cloudflare loads the content of your site in those locations/zone and actual users of your site gets your site loaded quite fast.

To reduce the cost of buying VPS's in various places, you can use NAT-VPS's. They comes at a very cheap price. Maybe $1/annum!!!

## Usage

For usage please refer to the [wiki](https://github.com/coderuse/ping-url/wiki)

## License

```
Copyright 2016 Arnab Das <arnab.social@live.in>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```