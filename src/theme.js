import { extendTheme } from "@chakra-ui/react"
import "@fontsource/roboto-slab";
import "@fontsource/fira-sans";

const theme = extendTheme({
    fonts: {
        heading: "Roboto Slab",
        body: "Fira Sans",
    },
})

export default theme