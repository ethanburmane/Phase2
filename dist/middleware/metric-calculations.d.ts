export declare function calculateBusFactor(url: string): Promise<number>;
export declare function calculateCorrectness(url: string): Promise<number>;
export declare function calculateRampUpTime(url: string): Promise<void>;
export declare function calculateResponsiveness(url: string): Promise<1 | 0 | 0.4 | 0.6 | 0.9 | 0.8 | 0.7 | 0.5 | 0.3 | 0.2 | 0.1>;
export declare function calculateLicenseCompliance(url: string): Promise<number>;
