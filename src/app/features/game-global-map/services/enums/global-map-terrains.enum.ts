export enum GlobalMapTerrains {
  SHALLOW_WATER = 'Shallow Water',
  INTERMEDIATE_WATER = 'Intermediate Water',
  DEEP_WATER = 'Deep Water',
  FLAT_LAND = 'Flat Land',

  // SHALLOW_WATER с прилегающим FLAT_LAND по сторонам света
  SHALLOW_WATER_FLAT_LAND_N = 'Shallow Water with Flat Land (N)',
  SHALLOW_WATER_FLAT_LAND_NE = 'Shallow Water with Flat Land (NE)',
  SHALLOW_WATER_FLAT_LAND_E = 'Shallow Water with Flat Land (E)',
  SHALLOW_WATER_FLAT_LAND_SE = 'Shallow Water with Flat Land (SE)',
  SHALLOW_WATER_FLAT_LAND_S = 'Shallow Water with Flat Land (S)',
  SHALLOW_WATER_FLAT_LAND_SW = 'Shallow Water with Flat Land (SW)',
  SHALLOW_WATER_FLAT_LAND_W = 'Shallow Water with Flat Land (W)',
  SHALLOW_WATER_FLAT_LAND_NW = 'Shallow Water with Flat Land (NW)',

  // FLAT_LAND с прилегающим SHALLOW_WATER по сторонам света
  FLAT_LAND_SHALLOW_WATER_N = 'Flat Land with Shallow Water (N)',
  FLAT_LAND_SHALLOW_WATER_NE = 'Flat Land with Shallow Water (NE)',
  FLAT_LAND_SHALLOW_WATER_E = 'Flat Land with Shallow Water (E)',
  FLAT_LAND_SHALLOW_WATER_SE = 'Flat Land with Shallow Water (SE)',
  FLAT_LAND_SHALLOW_WATER_S = 'Flat Land with Shallow Water (S)',
  FLAT_LAND_SHALLOW_WATER_SW = 'Flat Land with Shallow Water (SW)',
  FLAT_LAND_SHALLOW_WATER_W = 'Flat Land with Shallow Water (W)',
  FLAT_LAND_SHALLOW_WATER_NW = 'Flat Land with Shallow Water (NW)',
}
