import React from "react";
import "./footer.css";

const LicenseFooter = () => {
    return <div>
        All content licensed under <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution License</a>.
    </div>
}

const CreditFooter = () => {
    return <div>
        Made with ❤️ by <a href="https://words.yuvi.in">Yuvi Panda</a> | <a href="https://twitter.com/yuvipanda">Tell me</a> you like it! | <a href="https://github.com/yuvipanda/ipynb.pub/issues">Report bugs</a>
    </div>

}

export { LicenseFooter, CreditFooter };