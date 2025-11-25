const calculationService = require('../../src/services/calculation.service');

describe('Calculation Service', () => {
    describe('calculateBMR', () => {
        it('should calculate BMR for men correctly', () => {
            // Formula: 10 * weight + 6.25 * height - 5 * age + 5
            // Example: 80kg, 180cm, 30 years
            // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
            const bmr = calculationService.calculateBMR(80, 180, 'H', 30);
            expect(bmr).toBe(1780);
        });

        it('should calculate BMR for women correctly', () => {
            // Formula: 10 * weight + 6.25 * height - 5 * age - 161
            // Example: 60kg, 165cm, 30 years
            // 10*60 + 6.25*165 - 5*30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
            const bmr = calculationService.calculateBMR(60, 165, 'F', 30);
            expect(bmr).toBe(1320.25);
        });
    });

    describe('calculateTDEE', () => {
        it('should calculate TDEE correctly', () => {
            const bmr = 1500;
            const activityFactor = 1.55;
            const tdee = calculationService.calculateTDEE(bmr, activityFactor);
            expect(tdee).toBe(2325);
        });
    });

    describe('calculateWeightLossCalories', () => {
        it('should calculate weight loss calories with default factor', () => {
            const tdee = 2000;
            const calories = calculationService.calculateWeightLossCalories(tdee);
            expect(calories).toBe(1800); // 2000 * 0.9
        });

        it('should calculate weight loss calories with custom factor', () => {
            const tdee = 2000;
            const calories = calculationService.calculateWeightLossCalories(tdee, 0.8);
            expect(calories).toBe(1600); // 2000 * 0.8
        });
    });

    describe('calculateWeightGainCalories', () => {
        it('should calculate weight gain calories with default factor', () => {
            const tdee = 2000;
            const calories = calculationService.calculateWeightGainCalories(tdee);
            expect(calories).toBe(2200); // 2000 * 1.1
        });

        it('should calculate weight gain calories with custom factor', () => {
            const tdee = 2000;
            const calories = calculationService.calculateWeightGainCalories(tdee, 1.2);
            expect(calories).toBe(2400); // 2000 * 1.2
        });
    });

    describe('calculateTotalCaloricDeficit', () => {
        it('should calculate total caloric deficit correctly', () => {
            // 5kg loss * 7700 = 38500
            const deficit = calculationService.calculateTotalCaloricDeficit(-5);
            expect(deficit).toBe(38500);
        });

        it('should handle positive input as absolute value', () => {
            // 5kg loss * 7700 = 38500
            const deficit = calculationService.calculateTotalCaloricDeficit(5);
            expect(deficit).toBe(38500);
        });
    });

    describe('calculateTotalCaloricSurplus', () => {
        it('should calculate total caloric surplus correctly', () => {
            // 5kg gain * 7700 = 38500
            const surplus = calculationService.calculateTotalCaloricSurplus(5);
            expect(surplus).toBe(38500);
        });
    });

    describe('calculateDailyCaloricDeficit', () => {
        it('should calculate daily caloric deficit correctly', () => {
            const tdee = 2000;
            const dailyCalories = 1500;
            const deficit = calculationService.calculateDailyCaloricDeficit(tdee, dailyCalories);
            expect(deficit).toBe(500);
        });
    });

    describe('calculateDailyCaloricSurplus', () => {
        it('should calculate daily caloric surplus correctly', () => {
            const tdee = 2000;
            const dailyCalories = 2500;
            const surplus = calculationService.calculateDailyCaloricSurplus(dailyCalories, tdee);
            expect(surplus).toBe(500);
        });
    });

    describe('calculateDaysToGoal', () => {
        it('should calculate days to goal correctly', () => {
            const totalChange = 7700;
            const dailyChange = 500;
            const days = calculationService.calculateDaysToGoal(totalChange, dailyChange);
            expect(days).toBe(16); // Math.ceil(15.4) -> 16
        });

        it('should return 0 if daily change is too small', () => {
            const totalChange = 7700;
            const dailyChange = 0.5;
            const days = calculationService.calculateDaysToGoal(totalChange, dailyChange);
            expect(days).toBe(0);
        });
    });

    describe('calculateWeeksToGoal', () => {
        it('should calculate weeks to goal correctly', () => {
            const days = 20;
            const weeks = calculationService.calculateWeeksToGoal(days);
            expect(weeks).toBe(3); // Math.ceil(20/7) -> 3
        });
    });

    describe('calculateBMI', () => {
        it('should calculate BMI correctly', () => {
            // 80kg, 180cm -> 80 / (1.8 * 1.8) = 24.69
            const bmi = calculationService.calculateBMI(80, 180);
            expect(bmi).toBeCloseTo(24.69, 2);
        });
    });

    describe('validateTargetWeight', () => {
        it('should validate a healthy target weight', () => {
            // BMI = 24.69 (Valid: 18.5 - 30)
            const result = calculationService.validateTargetWeight(80, 180);
            expect(result.isValid).toBe(true);
            expect(result.targetBMI).toBe(24.7);
            expect(result.message).toBe('Poids cible valide');
        });

        it('should invalidate a low target weight', () => {
            // 50kg, 180cm -> BMI = 15.43 (Invalid < 18.5)
            const result = calculationService.validateTargetWeight(50, 180);
            expect(result.isValid).toBe(false);
            expect(result.targetBMI).toBe(15.4);
            expect(result.message).toBe('Le poids cible résulterait en un IMC non recommandé');
        });

        it('should invalidate a high target weight', () => {
            // 100kg, 180cm -> BMI = 30.86 (Invalid > 30)
            const result = calculationService.validateTargetWeight(100, 180);
            expect(result.isValid).toBe(false);
            expect(result.targetBMI).toBe(30.9);
            expect(result.message).toBe('Le poids cible résulterait en un IMC non recommandé');
        });
    });

    describe('calculateMacroDistribution', () => {
        it('should calculate macro distribution correctly', () => {
            const dailyCalories = 2000;
            const carbsPct = 50;
            const proteinPct = 30;
            const fatPct = 20;

            const result = calculationService.calculateMacroDistribution(dailyCalories, carbsPct, proteinPct, fatPct);

            expect(result.carbs.calories).toBe(1000);
            expect(result.carbs.grams).toBe(250); // 1000 / 4

            expect(result.protein.calories).toBe(600);
            expect(result.protein.grams).toBe(150); // 600 / 4

            expect(result.fat.calories).toBe(400);
            expect(result.fat.grams).toBe(44); // 400 / 9 = 44.44 -> 44
        });
    });

    describe('calculateWeightChangeEstimation', () => {
        it('should calculate estimation for weight loss', () => {
            // 80kg -> 75kg, 180cm, H, 30y, 1.55
            // BMR = 1780
            // TDEE = 1780 * 1.55 = 2759
            // Weight Loss -> Daily = 2759 * 0.9 = 2483.1
            // Caloric Adjustment = 2483.1 - 2759 = -275.9
            // Total Deficit = 5 * 7700 = 38500
            // Daily Deficit = 275.9
            // Days = 38500 / 275.9 = 139.5 -> 140
            // Weeks = 140 / 7 = 20
            // Weekly Change = -5 / 20 = -0.25

            const result = calculationService.calculateWeightChangeEstimation(80, 75, 180, 'H', 30, 1.55);

            expect(result.orientation).toBe('loss');
            expect(result.bmr).toBe(1780);
            expect(result.tdee).toBe(2759);
            expect(result.dailyCalories).toBe(2483);
            expect(result.caloricAdjustment).toBe(-276);
            expect(result.estimatedDays).toBe(140);
            expect(result.estimatedWeeks).toBe(20);
            expect(result.weeklyChange).toBe(-0.25);
        });

        it('should calculate estimation for weight gain', () => {
            // 70kg -> 75kg, 180cm, H, 30y, 1.55
            // BMR = 10*70 + 6.25*180 - 5*30 + 5 = 700 + 1125 - 150 + 5 = 1680
            // TDEE = 1680 * 1.55 = 2604
            // Weight Gain -> Daily = 2604 * 1.1 = 2864.4
            // Caloric Adjustment = 2864.4 - 2604 = 260.4
            // Total Surplus = 5 * 7700 = 38500
            // Daily Surplus = 260.4
            // Days = 38500 / 260.4 = 147.8 -> 148
            // Weeks = 148 / 7 = 22
            // Weekly Change = 5 / 22 = 0.23

            const result = calculationService.calculateWeightChangeEstimation(70, 75, 180, 'H', 30, 1.55);

            expect(result.orientation).toBe('gain');
            expect(result.bmr).toBe(1680);
            expect(result.tdee).toBe(2604);
            expect(result.dailyCalories).toBe(2864);
            expect(result.caloricAdjustment).toBe(260);
            expect(result.estimatedDays).toBe(148);
            expect(result.estimatedWeeks).toBe(22);
            expect(result.weeklyChange).toBe(0.23);
        });

        it('should calculate estimation for weight maintenance', () => {
            const result = calculationService.calculateWeightChangeEstimation(80, 80, 180, 'H', 30, 1.55);

            expect(result.orientation).toBe('maintain');
            expect(result.caloricAdjustment).toBe(0);
            expect(result.estimatedDays).toBe(0);
            expect(result.estimatedWeeks).toBe(0);
            expect(result.weeklyChange).toBe(0);
        });
    });
});
