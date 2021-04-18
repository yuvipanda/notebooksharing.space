import { Box, Link, VStack } from "@chakra-ui/layout";
import React from "react";

// Maybe this is the canonical way to repeat elements with a certain style?
const FooterLink = ({ children, ...props }) => {
    return <Link {...props} borderBottom="1px dotted" borderBottomColor="gray.400" _hover={{ borderBottomColor: "gray.800" }}>{children}</Link>
};

const Footer = ({ showsContent, ...props }) => {
    return <VStack textAlign="center" color="gray.600" borderTop="1px dotted" borderColor="gray.400" {...props}>
        {showsContent &&
            <Box>
                All content licensed under <FooterLink href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution License</FooterLink> unless othewrise specified.
        </Box>
        }
        <Box>
            Made with ❤️ by <FooterLink href="https://words.yuvi.in">Yuvi Panda</FooterLink> | <FooterLink href="https://twitter.com/yuvipanda">Tell me</FooterLink> you like it! | <FooterLink href="https://github.com/yuvipanda/ipynb.pub/issues">Report bugs</FooterLink> | <FooterLink href="mailto:yuvipanda+abuse@gmail.com">Report abuse</FooterLink>
        </Box>
    </VStack >
}
export { Footer };
