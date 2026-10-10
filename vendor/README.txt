OPTIONAL: self-host three.js so the site never depends on a CDN.

1. Download this file and save it here as  vendor/three.min.js
   https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
   (it must be version r128 - the page was built against that release)
2. That's it. index.html tries this file first, then cdnjs, then jsDelivr.
