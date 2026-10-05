const ANPC_BASE_URL =
    "https://monitorulpreturilor.info/pmonsvc/Gas";

export type AnpcStation = {
    id: string;
    name: string;
    updatedate: string;

    network?: {
        id: string;
        name: string;
        logo?: {
            logouri?: string;
        };
    };

    addr?: {
        addrstring?: string;
        zipcode?: string;

        location?: {
            Lat: number;
            Lon: number;
        };

        uatid?: string;
        contactdetails?: string;
    };
};

export type AnpcProduct = {
    id: string;
    stationid: string;
    name: string;
    price: number;

    distance?: number;

    network?: {
        id: string;
        name: string;
    };

    catprod?: {
        id: string;
        name: string;
    };
};

export type AnpcResponse = {
    Stations: AnpcStation[];
    Products: AnpcProduct[];
    warnings?: unknown[];
};

export async function getGasItemsByLatLon({
    latitude,
    longitude,
    buffer = 10000,
    productId = "12",
}: {
    latitude: number;
    longitude: number;
    buffer?: number;
    productId?: string;
}) {
    const params = new URLSearchParams({
        lon: longitude.toString(),
        lat: latitude.toString(),
        buffer: buffer.toString(),
        CSVGasCatalogProductIds: productId,
        OrderBy: "dist",
    });

    const url =
        `${ANPC_BASE_URL}/GetGasItemsByLatLon?${params.toString()}`;

    const response = await fetch(url, {
        headers: {
            Accept: "application/json",
        },

        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(
            `ANPC request failed: ${response.status}`,
        );
    }

    return (await response.json()) as AnpcResponse;
}

export async function getUatByName(
    uatName: string,
) {
    const params = new URLSearchParams({
        uatname: uatName,
    });

    const url =
        `${ANPC_BASE_URL}/GetUATByName?${params.toString()}`;

    const response = await fetch(url, {
        headers: {
            Accept: "application/json",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(
            `ANPC UAT request failed: ${response.status}`,
        );
    }

    return await response.json();
}

export async function getGasItemsByUat({
    uatId,
    productId = "11",
}: {
    uatId: string;
    productId?: string;
}) {
    const params = new URLSearchParams({
        UatId: uatId,
        CSVGasCatalogProductIds: productId,
        OrderBy: "dist",
    });

    const url =
        `${ANPC_BASE_URL}/GetGasItemsByUat?${params.toString()}`;

    const response = await fetch(url, {
        headers: {
            Accept: "application/json",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(
            `ANPC request failed: ${response.status}`,
        );
    }

    return (await response.json()) as AnpcResponse;
}