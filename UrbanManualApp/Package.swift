// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "UrbanManualApp",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "UrbanManualApp",
            targets: ["UrbanManualApp"]
        )
    ],
    dependencies: [
        .package(url: "https://github.com/supabase/supabase-swift", from: "2.0.0")
    ],
    targets: [
        .target(
            name: "UrbanManualApp",
            dependencies: [
                .product(name: "Supabase", package: "supabase-swift")
            ]
        )
    ]
)
