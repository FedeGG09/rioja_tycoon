export const provinceNames = [
  "Famatina",
  "Chilecito",
  "Vinchina",
  "Villa Unión",
  "Arauco",
  "Aimogasta",
  "Chamical",
  "Nonogasta",
  "Guandacol",
  "Los Sauces",
  "Tama",
  "Paganzo",
  "Patquía",
  "San Blas de los Sauces",
  "Castro Barros",
  "Sañogasta",
  "Pituil",
  "Olta",
  "Catuna",
  "Portezuelo"
];

export const wineryNames = [
  "Bodega Finca del Famatina",
  "Bodega Valle del Bermejo",
  "Bodega Los Nogales",
  "Bodega Altos de Chilecito",
  "Bodega Ruta 150",
  "Bodega San Nicolás del Arauco",
  "Bodega Atardecer de Los Sauces",
  "Bodega Piedra del Río",
  "Bodega Las Lomas de Vinchina",
  "Bodega Mirador del Tala",
  "Bodega Terra Roja",
  "Bodega Cosecha del Oeste"
];

export const factoryNames = [
  "Agroindustrial Patquía",
  "Envases del Oeste",
  "Procesadora Río Seco",
  "Fraccionadora Sierra Azul",
  "Aceitera del Valle",
  "Planta de Frío San Blas",
  "Molinos y Harinas del Bermejo",
  "Cooperativa Industrial La Esperanza"
];

export const siloNames = [
  "Silos del Camino Real",
  "Terminal Granelera Norte",
  "Centro de Acopio 150",
  "Altos del Maíz",
  "Depósito El Chacho",
  "Nodo Logístico Sanagasta"
];

export const vehicleNames = {
  tractor: [
    "Arareño 240",
    "Famatina 410",
    "Andina 150",
    "Riojano 88",
    "Valle 360"
  ],
  harvester: [
    "Cosechadora Sierra X",
    "Cosechadora Norte 900",
    "Vendimia Pro 7",
    "Harvest 14R"
  ],
  worker: [
    "Brigada de campo",
    "Cuadrilla de riego",
    "Equipo de cosecha",
    "Supervisor de finca"
  ]
};

export type SiteLabel = {
  name: string;
  kind: "winery" | "factory" | "silo" | "farm";
};
