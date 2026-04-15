/**
 * CLI Output Utils Tests
 */

const {
    formatRating,
    formatStatus,
    formatPlayTime
} = require('../../src/cli/utils/output');

describe('CLI Output Utils', () => {
    describe('formatRating', () => {
        test('CLI-OUTPUT-RATING-001: 0分应返回"-"', () => {
            expect(formatRating(0)).toBe('-');
        });

        test('CLI-OUTPUT-RATING-002: 3分应返回"★★★☆☆"', () => {
            expect(formatRating(3)).toBe('★★★☆☆');
        });

        test('CLI-OUTPUT-RATING-003: 5分应返回"★★★★★"', () => {
            expect(formatRating(5)).toBe('★★★★★');
        });

        test('CLI-OUTPUT-RATING-004: 空值应返回"-"', () => {
            expect(formatRating(null)).toBe('-');
            expect(formatRating(undefined)).toBe('-');
        });
    });

    describe('formatStatus', () => {
        test('CLI-OUTPUT-STATUS-001: unwatched应返回"未看"', () => {
            expect(formatStatus('unwatched')).toBe('未看');
        });

        test('CLI-OUTPUT-STATUS-002: watching应返回"观看中"', () => {
            expect(formatStatus('watching')).toBe('观看中');
        });

        test('CLI-OUTPUT-STATUS-003: completed应返回"已完成"', () => {
            expect(formatStatus('completed')).toBe('已完成');
        });

        test('CLI-OUTPUT-STATUS-004: 未知状态应返回原值', () => {
            expect(formatStatus('unknown')).toBe('unknown');
            expect(formatStatus(null)).toBe('-');
        });
    });

    describe('formatPlayTime', () => {
        test('CLI-OUTPUT-PLAYTIME-001: 零值应返回"-"', () => {
            expect(formatPlayTime(0)).toBe('-');
            expect(formatPlayTime(null)).toBe('-');
        });

        test('CLI-OUTPUT-PLAYTIME-002: 分钟级应正确格式化', () => {
            expect(formatPlayTime(45)).toBe('45分钟');
        });

        test('CLI-OUTPUT-PLAYTIME-003: 小时级应正确格式化', () => {
            expect(formatPlayTime(125)).toBe('2小时 5分钟');
        });
    });
});
