/**
 * Represents the complete data structure for an item in the system.
 * Contains all specifications and details for doors, frames, and hardware.
 */
export type ItemData = {
  // Core identifiers
  ItemId: number
  OrderId: number | null

  // Basic properties
  DoorDesign: string | null
  FrameCompositeId: number | null
  Created: Date
  Status: string | null
  Type: string | null
  PhaseId: number | null

  // Images
  Thumbnail: string | null
  InternalImage: string | null
  externalImgUrl?: string // For backwards compatibility
  internalImgUrl?: string // For backwards compatibility

  // Location info
  Address: string | null
  Location: string | null
  Numerals: string | null
  PostCode: string | null
  Block: string | null
  Floor: string | null

  // General info
  Notes: string | null
  TotalValue: number | null
  TotalWeight: number | null

  // Colors
  ExternalFrameColourCode: string | null
  InternalFrameColourCode: string | null
  ExternalSashColourCode: string | null
  InternalSashColourCode: string | null
  ExternalColour: string | null
  ExternalColourId: string | null
  ExternalColourRal: string | null
  ExternalColourStockCode: string | null
  InternalColour: string | null
  InternalColourRal: string | null
  ExternalFrameColourDescription: string | null
  InternalFrameColourDescription: string | null
  externalDoorColour?: string | null // For backwards compatibility
  externalFrameColour?: string | null // For backwards compatibility

  // Manufacturing/processing
  FinishLocation: string | null
  BmTradaCertification: string | null
  CE: string | null

  // Door hardware
  Cylinder: string | null
  DoorChain: string | null
  DoorCloser: string | null
  DoorHanding: string | null
  DoorKnocker: string | null
  DoorOpens: string | null
  DoorThickness: string | null
  Escutcheon: string | null
  Handle: string | null
  HardwareSuite: string | null
  hardwareFinish?: string | null // For backwards compatibility
  KickPlate: string | null
  KickPlatePlacement: string | null
  LetterPlate: string | null
  LockOption: string | null
  PullHandle: string | null
  RainDeflector: string | null
  SpyHole1: string | null
  SpyHole2: string | null

  // Dimensions
  FanlightHeight: string | null
  FanlightPackerLeft: string | null
  FanlightPackerRight: string | null
  Height: string | null
  LeftSideWidth: string | null
  MasterPosition: string | null
  Master_SashHeight: string | null
  Master_SashWidth: string | null
  MasterWidth: string | null
  RightSideWidth: string | null
  SashHeight: string | null
  SashWidth: string | null
  SlaveWidth: string | null
  Width: string | null
  DoorWidth: string | null
  DoorHeight: string | null
  OverallFrameWidth: string | null
  OverallWidth: string | null
  OverallHeight: string | null
  size?: string | null // For backwards compatibility

  // Frame elements
  FrameFinish: string | null
  FrameFinishDesc: string | null
  FrameMaterial: string | null
  LiniarFrameCode: string | null
  LEftArchitraveExternal1: string | null
  LeftArchitraveExternal2: string | null
  LeftArchitraveInternal1: string | null
  LeftArchitraveInternal2: string | null
  LeftLiningExternal: string | null
  LeftLiningInternal: string | null
  LeftPacker1: string | null
  LeftPacker2: string | null
  RightArchitraveExternal1: string | null
  RightArchitraveExternal2: string | null
  RightArchitraveInternal1: string | null
  RightArchitraveInternal2: string | null
  RightLiningExternal: string | null
  RightLiningInternal: string | null
  RightPacker1: string | null
  RightPAcker2: string | null
  SidelightPacker: string | null
  SubSill: string | null
  System: string | null
  system?: string | null // For backwards compatibility
  Threshold: string | null
  ThresholdLayout: string | null
  ThresholdPacker1: string | null
  ThresholdPacker2: string | null
  TopArchitraveExternal11: string | null
  TopArchitraveExternal2: string | null
  TopArchitraveInternal1: string | null
  TopArchitraveInternal2: string | null
  TopLiningExternal: string | null
  TopLiningInternal: string | null
  TopPacker1: string | null
  TopPacker2: string | null

  // Performance ratings
  FireIntegrity: string | null
  InsulationRating: string | null
  IntendedFireRating: string | null
  SBD: string | null
  SmokeControl: string | null
  ThermalPerformance: string | null

  // Signage
  Signage: string | null
  SignagePlacement: string | null
  NumeralsPosition: string | null
  InternalSignage: string | null
  ExternalSignage: string | null

  // Slave door components
  Slave_Cylinder: string | null
  Slave_DoorChain: string | null
  Slave_DoorCloser: string | null
  Slave_DoorKnocker: string | null
  Slave_Escutcheon: string | null
  Slave_Handle: string | null
  Slave_KickPlate: string | null
  Slave_KickPlatePlacement: string | null
  Slave_LetterPlate: string | null
  Slave_LockOption: string | null
  Slave_PullHandle: string | null
  Slave_SashHeight: string | null
  Slave_SashWidth: string | null
  Slave_Signage: string | null
  Slave_SignagePlacement: string | null
  Slave_SpyHole1: string | null
  Slave_SpyHole2: string | null
  SlaveInternalSignage: string | null
  SlaveExternalSignage: string | null
  SlaveInternalKickPlate: string | null
  SlaveExternalKickPlate: string | null

  // Glass
  GlassTheme: string | null
  glassTheme?: string | null // For backwards compatibility
  DoorGlassTheme: string | null
  DoorGlassThemeName: string | null
  LeftSidelightGlassTheme: string | null
  LeftSidelightGlassThemeName: string | null
  RighttSidelightGlassTheme: string | null
  RightSidelightGlassThemeName: string | null
  fanlightGlassTheme: string | null
  fanlightGlassThemeName: string | null
  FrameGlassTheme: string | null
  SashGlassTheme: string | null

  // Backing glass
  DoorBackingGlass: string | null
  backingGlass?: string | null // For backwards compatibility
  LeftSidelightBackingGlass: string | null
  RightSidelightBackingGlass: string | null
  FanlightBackingGlass: string | null

  // Additional hardware urls
  thresholdUrl: string | null
  closerUrl: string | null
  handleUrl: string | null

  // Additional components
  InternalKickPlate: string | null
  ExternalKickPlate: string | null

  // Additional field for simple design
  design?: string | null // For backwards compatibility
}

export interface GlassUnit {
  Id: number
  ItemId: number
  StockCode: string
  Description: string
  Quantity: number
  Width: number | null
  Height: number | null
  ForDropDown: boolean
  SubAssembly: string
  Price: number | null
  WinSysStockCategoryId: number | null
  UsageDescription: string | null
  AnalysisCode: string | null
  AxBomLevel: number | null
  CostCentre: string | null
  AxStockCode: string | null
}
