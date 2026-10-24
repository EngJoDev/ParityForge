import type { ComparisonPolicy, MismatchRecord } from '../types/index';

export class DeterministicComparator {
  /**
   * تقارن بين خرج مرجعي (Reference) وخرج مرشح (Candidate) طبقاً للسياسة المحددة
   */
  public static compare(
    reference: unknown,
    candidate: unknown,
    policy: ComparisonPolicy,
    currentPath: string = '$'
  ): MismatchRecord[] {
    const mismatches: MismatchRecord[] = [];

    // 1. تحقق من المسارات المستثناة صراحة (Ignored Paths)
    if (policy.ignoredPaths.includes(currentPath) || policy.ignoredPaths.includes(currentPath.replace(/^\$\./, ''))) {
      return mismatches;
    }

    // 2. معالجة القيم الفارغة (Null & Undefined)
    if (reference === null || reference === undefined || candidate === null || candidate === undefined) {
      if (reference !== candidate) {
        if (
          policy.nullAndMissingSemantics === 'loose' &&
          (reference === null || reference === undefined) &&
          (candidate === null || candidate === undefined)
        ) {
          return mismatches;
        }
        mismatches.push({
          path: currentPath,
          category: 'VALUE_MISMATCH',
          referenceValue: reference,
          candidateValue: candidate,
          message: `Expected ${JSON.stringify(reference)} at path ${currentPath}, but observed ${JSON.stringify(candidate)}`
        });
      }
      return mismatches;
    }

    // 3. فحص تطابق أنواع البيانات الأولية (Type Equality)
    const refType = typeof reference;
    const candType = typeof candidate;

    if (refType !== candType) {
      mismatches.push({
        path: currentPath,
        category: 'TYPE_MISMATCH',
        referenceValue: reference,
        candidateValue: candidate,
        message: `Type divergence at ${currentPath}: Reference is '${refType}', Candidate is '${candType}'`
      });
      return mismatches;
    }

    // 4. مقارنة الأرقام مع التفاوت المسموح (Numeric Tolerance)
    if (refType === 'number') {
      const refNum = reference as number;
      const candNum = candidate as number;

      if (isNaN(refNum) || isNaN(candNum)) {
        if (isNaN(refNum) !== isNaN(candNum)) {
          mismatches.push({
            path: currentPath,
            category: 'VALUE_MISMATCH',
            referenceValue: reference,
            candidateValue: candidate,
            message: `NaN value mismatch at ${currentPath}`
          });
        }
        return mismatches;
      }

      const delta = Math.abs(refNum - candNum);
      if (delta > policy.numericTolerance) {
        mismatches.push({
          path: currentPath,
          category: 'FLOAT_PRECISION',
          referenceValue: refNum,
          candidateValue: candNum,
          message: `Numeric delta of ${delta.toFixed(6)} exceeds allowed tolerance of ${policy.numericTolerance} at ${currentPath}`
        });
      }
      return mismatches;
    }

    // 5. مقارنة النصوص والمنطقيات البسيطة (Strings & Booleans)
    if (refType === 'string' || refType === 'boolean') {
      if (reference !== candidate) {
        mismatches.push({
          path: currentPath,
          category: 'VALUE_MISMATCH',
          referenceValue: reference,
          candidateValue: candidate,
          message: `Value mismatch at ${currentPath}: Expected "${reference}", found "${candidate}"`
        });
      }
      return mismatches;
    }

    // 6. مقارنة المصفوفات (Arrays)
    if (Array.isArray(reference) && Array.isArray(candidate)) {
      if (reference.length !== candidate.length) {
        mismatches.push({
          path: currentPath,
          category: 'VALUE_MISMATCH',
          referenceValue: `Array(length=${reference.length})`,
          candidateValue: `Array(length=${candidate.length})`,
          message: `Array length mismatch at ${currentPath}: Reference has ${reference.length} items, Candidate has ${candidate.length}`
        });
      }
      const minLen = Math.min(reference.length, candidate.length);
      for (let i = 0; i < minLen; i++) {
        mismatches.push(...this.compare(reference[i], candidate[i], policy, `${currentPath}[${i}]`));
      }
      return mismatches;
    }

    // 7. مقارنة الكائنات المتداخلة (Nested JSON Objects)
    if (refType === 'object') {
      const refObj = reference as Record<string, unknown>;
      const candObj = candidate as Record<string, unknown>;

      const refKeys = Object.keys(refObj);
      const candKeys = Object.keys(candObj);

      // فحص الحقول المفقودة في الخرج المرشح (Missing Fields)
      for (const key of refKeys) {
        const keyPath = currentPath === '$' ? `$.${key}` : `${currentPath}.${key}`;
        if (!Object.prototype.hasOwnProperty.call(candObj, key)) {
          if (!policy.ignoredPaths.includes(keyPath) && !policy.ignoredPaths.includes(key)) {
            mismatches.push({
              path: keyPath,
              category: 'MISSING_FIELD',
              referenceValue: refObj[key],
              candidateValue: undefined,
              message: `Field '${key}' is missing in candidate output at ${keyPath}`
            });
          }
        } else {
          mismatches.push(...this.compare(refObj[key], candObj[key], policy, keyPath));
        }
      }

      // فحص الحقول الإضافية غير المتوقعة (Extra Fields) لو مفعل Strict
      if (policy.strictStructuralEquality) {
        for (const key of candKeys) {
          const keyPath = currentPath === '$' ? `$.${key}` : `${currentPath}.${key}`;
          if (!Object.prototype.hasOwnProperty.call(refObj, key)) {
            if (!policy.ignoredPaths.includes(keyPath) && !policy.ignoredPaths.includes(key)) {
              mismatches.push({
                path: keyPath,
                category: 'EXTRA_FIELD',
                referenceValue: undefined,
                candidateValue: candObj[key],
                message: `Unexpected extra field '${key}' detected in candidate output at ${keyPath}`
              });
            }
          }
        }
      }

      return mismatches;
    }

    return mismatches;
  }
}