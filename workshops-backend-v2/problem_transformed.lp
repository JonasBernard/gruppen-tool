\ SCIP STATISTICS
\   Problem name     : t_GroupAssignment
\   Variables        : 110 (110 binary, 0 integer, 0 implicit integer, 0 continuous)
\   Constraints      : 41
Maximize
 Obj: +2 t_assign_1_0 +4 t_assign_5_0 +2 t_assign_5_3 +3 t_assign_6_0 +2 t_assign_6_1 +5 t_assign_6_5
      +4 t_assign_6_6 +1 t_assign_7_3 +3 t_assign_8_0 +2 t_assign_8_1 +5 t_assign_8_3 +3 t_assign_9_0
      +5 t_assign_9_3 +2 t_assign_9_5 +3 t_assign_12_0 +5 t_assign_12_1 +2 t_assign_12_3 +2 t_assign_13_1
      +5 t_assign_13_3 +2 t_assign_14_1 +5 t_assign_15_0 +4 t_assign_15_1 +3 t_assign_15_3 +2 t_assign_16_0
      +3 t_assign_16_1 +4 t_assign_16_2 +5 t_assign_16_3 +3 t_assign_17_0 +2 t_assign_17_3 +4 t_assign_18_0
      +5 t_assign_18_1 +3 t_assign_18_2 +2 t_assign_18_7 +4 t_assign_20_0 +3 t_assign_20_1 +5 t_assign_20_3
      +2 t_assign_21_1 +3 t_assign_21_3 +2 t_assign_22_0 +4 t_assign_22_3 +3 t_assign_23_0 +2 t_assign_24_0
      +3 t_assign_24_3 +4 t_assign_24_4 +5 t_assign_24_5 +4 t_assign_25_0 +3 t_assign_25_1 +5 t_assign_25_3
      +2 t_assign_26_0 +5 t_assign_26_3 +3 t_assign_28_0 +4 t_assign_28_3 +3 t_assign_29_0 +5 t_assign_29_3
      +2 t_assign_29_6 +2 t_assign_30_1 +5 t_assign_30_3 +3 t_assign_33_0 +2 t_assign_33_3 +2 t_assign_34_0
      +3 t_assign_34_3 +2 t_assign_36_3 +3 t_assign_37_3 +4 t_assign_38_0 +3 t_assign_38_1 +5 t_assign_38_3
      +2 t_assign_38_6 +3 t_assign_39_0 +4 t_assign_39_1 +5 t_assign_39_3 +2 t_assign_39_6 +2 t_assign_40_0
      +4 t_assign_40_3 +3 t_assign_42_3 +3 t_assign_43_0 +4 t_assign_43_1 +2 t_assign_43_2 +5 t_assign_43_3
      +4 t_assign_44_0 +3 t_assign_44_1 +5 t_assign_44_3 +3 t_assign_45_1 +5 t_assign_45_3 +4 t_assign_47_0
      +5 t_assign_47_1 +3 t_assign_47_2 +2 t_assign_47_4 +3 t_assign_48_0 +5 t_assign_49_1 +2 t_assign_49_2
      +3 t_assign_49_3 +4 t_assign_49_6 +4 t_assign_50_0 +2 t_assign_50_1 +3 t_assign_50_3 +3 t_assign_51_0
      +5 t_assign_51_1 +4 t_assign_51_3 +2 t_assign_52_0 +3 t_assign_52_1 +5 t_assign_52_3 +2 t_assign_53_0
      +3 t_assign_53_3 +4 t_assign_54_0 +2 t_assign_54_1 +3 t_assign_54_3 +1 t_assign_55_3 -5 t_assign_10_none_bin
      -2 t_assign_19_none_bin -5 t_assign_0_none_bin +146
Subject to
 num_assignments_47: +1 t_assign_47_0 +1 t_assign_47_1 +1 t_assign_47_2 +1 t_assign_47_4 <= +2
 num_assignments_18: +1 t_assign_18_0 +1 t_assign_18_1 +1 t_assign_18_2 +1 t_assign_18_7 <= +2
 num_assignments_39: +1 t_assign_39_0 +1 t_assign_39_1 +1 t_assign_39_3 +1 t_assign_39_6 <= +2
 cap_3: +1 t_assign_5_3 +1 t_assign_7_3 +1 t_assign_8_3 +1 t_assign_9_3 +1 t_assign_12_3 +1 t_assign_13_3
  +1 t_assign_15_3 +1 t_assign_16_3 +1 t_assign_17_3 +1 t_assign_20_3 +1 t_assign_21_3 +1 t_assign_22_3
  +1 t_assign_24_3 +1 t_assign_25_3 +1 t_assign_26_3 +1 t_assign_28_3 +1 t_assign_29_3 +1 t_assign_30_3
  +1 t_assign_33_3 +1 t_assign_34_3 +1 t_assign_36_3 +1 t_assign_37_3 +1 t_assign_38_3 +1 t_assign_39_3
  +1 t_assign_40_3 +1 t_assign_42_3 +1 t_assign_43_3 +1 t_assign_44_3 +1 t_assign_45_3 +1 t_assign_49_3
  +1 t_assign_50_3 +1 t_assign_51_3 +1 t_assign_52_3 +1 t_assign_53_3 +1 t_assign_54_3 +1 t_assign_55_3
  -1 t_assign_10_none_bin -1 t_assign_0_none_bin <= +18
 num_assignments_43: +1 t_assign_43_0 +1 t_assign_43_1 +1 t_assign_43_2 +1 t_assign_43_3 <= +2
 num_assignments_49: +1 t_assign_49_1 +1 t_assign_49_2 +1 t_assign_49_3 +1 t_assign_49_6 <= +2
 num_assignments_38: +1 t_assign_38_0 +1 t_assign_38_1 +1 t_assign_38_3 +1 t_assign_38_6 <= +2
 cap_0: +1 t_assign_1_0 +1 t_assign_5_0 +1 t_assign_6_0 +1 t_assign_8_0 +1 t_assign_9_0 +1 t_assign_12_0
  +1 t_assign_15_0 +1 t_assign_16_0 +1 t_assign_17_0 +1 t_assign_18_0 +1 t_assign_20_0 +1 t_assign_22_0
  +1 t_assign_23_0 +1 t_assign_24_0 +1 t_assign_25_0 +1 t_assign_26_0 +1 t_assign_28_0 +1 t_assign_29_0
  +1 t_assign_33_0 +1 t_assign_34_0 +1 t_assign_38_0 +1 t_assign_39_0 +1 t_assign_40_0 +1 t_assign_43_0
  +1 t_assign_44_0 +1 t_assign_47_0 +1 t_assign_48_0 +1 t_assign_50_0 +1 t_assign_51_0 +1 t_assign_52_0
  +1 t_assign_53_0 +1 t_assign_54_0 -1 t_assign_19_none_bin <= +19
 num_assignments_24: +1 t_assign_24_0 +1 t_assign_24_3 +1 t_assign_24_4 +1 t_assign_24_5 <= +2
 num_assignments_16: +1 t_assign_16_0 +1 t_assign_16_1 +1 t_assign_16_2 +1 t_assign_16_3 <= +2
 cap_1: +1 t_assign_6_1 +1 t_assign_8_1 +1 t_assign_12_1 +1 t_assign_13_1 +1 t_assign_14_1 +1 t_assign_15_1
  +1 t_assign_16_1 +1 t_assign_18_1 +1 t_assign_20_1 +1 t_assign_21_1 +1 t_assign_25_1 +1 t_assign_30_1
  +1 t_assign_38_1 +1 t_assign_39_1 +1 t_assign_43_1 +1 t_assign_44_1 +1 t_assign_45_1 +1 t_assign_47_1
  +1 t_assign_49_1 +1 t_assign_50_1 +1 t_assign_51_1 +1 t_assign_52_1 +1 t_assign_54_1 <= +20
 num_assignments_6: +1 t_assign_6_0 +1 t_assign_6_1 +1 t_assign_6_5 +1 t_assign_6_6 <= +2
 orbitope_component_8_1row_comp_8_col0: +1 t_assign_0_none_bin -1 t_assign_10_none_bin <= +0
 orbitope_component_11_1row_comp_11_col0: +1 t_assign_42_3 -1 t_assign_37_3 <= +0
 orbitope_component_10_1row_comp_10_col0: +1 t_assign_48_0 -1 t_assign_23_0 <= +0
 orbitope_component_3_1row_comp_3_col0: +1 t_assign_55_3 -1 t_assign_7_3 <= +0
 orbitope_component_0_1row_comp_0_col0: +1 t_assign_40_0 -1 t_assign_1_0 <= +0
 num_assignments_29: -1 t_assign_29_0 -1 t_assign_29_3 -1 t_assign_29_6 >= -2
 num_assignments_8: -1 t_assign_8_0 -1 t_assign_8_1 -1 t_assign_8_3 >= -2
 num_assignments_9: -1 t_assign_9_0 -1 t_assign_9_3 -1 t_assign_9_5 >= -2
 num_assignments_54: -1 t_assign_54_0 -1 t_assign_54_1 -1 t_assign_54_3 >= -2
 num_assignments_44: -1 t_assign_44_0 -1 t_assign_44_1 -1 t_assign_44_3 >= -2
 num_assignments_12: -1 t_assign_12_0 -1 t_assign_12_1 -1 t_assign_12_3 >= -2
 num_assignments_25: -1 t_assign_25_0 -1 t_assign_25_1 -1 t_assign_25_3 >= -2
 num_assignments_50: -1 t_assign_50_0 -1 t_assign_50_1 -1 t_assign_50_3 >= -2
 num_assignments_15: -1 t_assign_15_0 -1 t_assign_15_1 -1 t_assign_15_3 >= -2
 num_assignments_52: -1 t_assign_52_0 -1 t_assign_52_1 -1 t_assign_52_3 >= -2
 num_assignments_51: -1 t_assign_51_0 -1 t_assign_51_1 -1 t_assign_51_3 >= -2
 num_assignments_20: -1 t_assign_20_0 -1 t_assign_20_1 -1 t_assign_20_3 >= -2
 num_assignments_33: -1 t_assign_33_0 -1 t_assign_33_3 >= -1
 num_assignments_30: -1 t_assign_30_1 -1 t_assign_30_3 >= -1
 num_assignments_28: -1 t_assign_28_0 -1 t_assign_28_3 >= -1
 num_assignments_26: -1 t_assign_26_0 -1 t_assign_26_3 >= -1
 num_assignments_22: -1 t_assign_22_0 -1 t_assign_22_3 >= -1
 num_assignments_5: -1 t_assign_5_0 -1 t_assign_5_3 >= -1
 num_assignments_45: -1 t_assign_45_1 -1 t_assign_45_3 >= -1
 num_assignments_21: -1 t_assign_21_1 -1 t_assign_21_3 >= -1
 num_assignments_53: -1 t_assign_53_0 -1 t_assign_53_3 >= -1
 num_assignments_13: -1 t_assign_13_1 -1 t_assign_13_3 >= -1
 num_assignments_17: -1 t_assign_17_0 -1 t_assign_17_3 >= -1
 num_assignments_34: -1 t_assign_34_0 -1 t_assign_34_3 >= -1
Bounds
 0 <= t_assign_1_0 <= 1
 0 <= t_assign_5_0 <= 1
 0 <= t_assign_5_3 <= 1
 0 <= t_assign_6_0 <= 1
 0 <= t_assign_6_1 <= 1
 0 <= t_assign_6_5 <= 1
 0 <= t_assign_6_6 <= 1
 0 <= t_assign_7_3 <= 1
 0 <= t_assign_8_0 <= 1
 0 <= t_assign_8_1 <= 1
 0 <= t_assign_8_3 <= 1
 0 <= t_assign_9_0 <= 1
 0 <= t_assign_9_3 <= 1
 0 <= t_assign_9_5 <= 1
 0 <= t_assign_12_0 <= 1
 0 <= t_assign_12_1 <= 1
 0 <= t_assign_12_3 <= 1
 0 <= t_assign_13_1 <= 1
 0 <= t_assign_13_3 <= 1
 0 <= t_assign_14_1 <= 1
 0 <= t_assign_15_0 <= 1
 0 <= t_assign_15_1 <= 1
 0 <= t_assign_15_3 <= 1
 0 <= t_assign_16_0 <= 1
 0 <= t_assign_16_1 <= 1
 0 <= t_assign_16_2 <= 1
 0 <= t_assign_16_3 <= 1
 0 <= t_assign_17_0 <= 1
 0 <= t_assign_17_3 <= 1
 0 <= t_assign_18_0 <= 1
 0 <= t_assign_18_1 <= 1
 0 <= t_assign_18_2 <= 1
 0 <= t_assign_18_7 <= 1
 0 <= t_assign_20_0 <= 1
 0 <= t_assign_20_1 <= 1
 0 <= t_assign_20_3 <= 1
 0 <= t_assign_21_1 <= 1
 0 <= t_assign_21_3 <= 1
 0 <= t_assign_22_0 <= 1
 0 <= t_assign_22_3 <= 1
 0 <= t_assign_23_0 <= 1
 0 <= t_assign_24_0 <= 1
 0 <= t_assign_24_3 <= 1
 0 <= t_assign_24_4 <= 1
 0 <= t_assign_24_5 <= 1
 0 <= t_assign_25_0 <= 1
 0 <= t_assign_25_1 <= 1
 0 <= t_assign_25_3 <= 1
 0 <= t_assign_26_0 <= 1
 0 <= t_assign_26_3 <= 1
 0 <= t_assign_28_0 <= 1
 0 <= t_assign_28_3 <= 1
 0 <= t_assign_29_0 <= 1
 0 <= t_assign_29_3 <= 1
 0 <= t_assign_29_6 <= 1
 0 <= t_assign_30_1 <= 1
 0 <= t_assign_30_3 <= 1
 0 <= t_assign_33_0 <= 1
 0 <= t_assign_33_3 <= 1
 0 <= t_assign_34_0 <= 1
 0 <= t_assign_34_3 <= 1
 0 <= t_assign_36_3 <= 1
 0 <= t_assign_37_3 <= 1
 0 <= t_assign_38_0 <= 1
 0 <= t_assign_38_1 <= 1
 0 <= t_assign_38_3 <= 1
 0 <= t_assign_38_6 <= 1
 0 <= t_assign_39_0 <= 1
 0 <= t_assign_39_1 <= 1
 0 <= t_assign_39_3 <= 1
 0 <= t_assign_39_6 <= 1
 0 <= t_assign_40_0 <= 1
 0 <= t_assign_40_3 <= 1
 0 <= t_assign_42_3 <= 1
 0 <= t_assign_43_0 <= 1
 0 <= t_assign_43_1 <= 1
 0 <= t_assign_43_2 <= 1
 0 <= t_assign_43_3 <= 1
 0 <= t_assign_44_0 <= 1
 0 <= t_assign_44_1 <= 1
 0 <= t_assign_44_3 <= 1
 0 <= t_assign_45_1 <= 1
 0 <= t_assign_45_3 <= 1
 0 <= t_assign_47_0 <= 1
 0 <= t_assign_47_1 <= 1
 0 <= t_assign_47_2 <= 1
 0 <= t_assign_47_4 <= 1
 0 <= t_assign_48_0 <= 1
 0 <= t_assign_49_1 <= 1
 0 <= t_assign_49_2 <= 1
 0 <= t_assign_49_3 <= 1
 0 <= t_assign_49_6 <= 1
 0 <= t_assign_50_0 <= 1
 0 <= t_assign_50_1 <= 1
 0 <= t_assign_50_3 <= 1
 0 <= t_assign_51_0 <= 1
 0 <= t_assign_51_1 <= 1
 0 <= t_assign_51_3 <= 1
 0 <= t_assign_52_0 <= 1
 0 <= t_assign_52_1 <= 1
 0 <= t_assign_52_3 <= 1
 0 <= t_assign_53_0 <= 1
 0 <= t_assign_53_3 <= 1
 0 <= t_assign_54_0 <= 1
 0 <= t_assign_54_1 <= 1
 0 <= t_assign_54_3 <= 1
 0 <= t_assign_55_3 <= 1
 0 <= t_assign_10_none_bin <= 1
 0 <= t_assign_19_none_bin <= 1
 0 <= t_assign_0_none_bin <= 1
Binaries
 t_assign_1_0 t_assign_5_0 t_assign_5_3 t_assign_6_0 t_assign_6_1 t_assign_6_5 t_assign_6_6 t_assign_7_3
 t_assign_8_0 t_assign_8_1 t_assign_8_3 t_assign_9_0 t_assign_9_3 t_assign_9_5 t_assign_12_0 t_assign_12_1
 t_assign_12_3 t_assign_13_1 t_assign_13_3 t_assign_14_1 t_assign_15_0 t_assign_15_1 t_assign_15_3 t_assign_16_0
 t_assign_16_1 t_assign_16_2 t_assign_16_3 t_assign_17_0 t_assign_17_3 t_assign_18_0 t_assign_18_1 t_assign_18_2
 t_assign_18_7 t_assign_20_0 t_assign_20_1 t_assign_20_3 t_assign_21_1 t_assign_21_3 t_assign_22_0 t_assign_22_3
 t_assign_23_0 t_assign_24_0 t_assign_24_3 t_assign_24_4 t_assign_24_5 t_assign_25_0 t_assign_25_1 t_assign_25_3
 t_assign_26_0 t_assign_26_3 t_assign_28_0 t_assign_28_3 t_assign_29_0 t_assign_29_3 t_assign_29_6 t_assign_30_1
 t_assign_30_3 t_assign_33_0 t_assign_33_3 t_assign_34_0 t_assign_34_3 t_assign_36_3 t_assign_37_3 t_assign_38_0
 t_assign_38_1 t_assign_38_3 t_assign_38_6 t_assign_39_0 t_assign_39_1 t_assign_39_3 t_assign_39_6 t_assign_40_0
 t_assign_40_3 t_assign_42_3 t_assign_43_0 t_assign_43_1 t_assign_43_2 t_assign_43_3 t_assign_44_0 t_assign_44_1
 t_assign_44_3 t_assign_45_1 t_assign_45_3 t_assign_47_0 t_assign_47_1 t_assign_47_2 t_assign_47_4 t_assign_48_0
 t_assign_49_1 t_assign_49_2 t_assign_49_3 t_assign_49_6 t_assign_50_0 t_assign_50_1 t_assign_50_3 t_assign_51_0
 t_assign_51_1 t_assign_51_3 t_assign_52_0 t_assign_52_1 t_assign_52_3 t_assign_53_0 t_assign_53_3 t_assign_54_0
 t_assign_54_1 t_assign_54_3 t_assign_55_3 t_assign_10_none_bin t_assign_19_none_bin t_assign_0_none_bin
End
