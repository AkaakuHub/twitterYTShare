import assert from 'node:assert/strict';
import test from 'node:test';
import { createShareText } from '../share-text.ts';

test('動画のタイトルと追跡パラメータのないURLを含む', () => {
  assert.equal(
    createShareText(' 曲名 ', 'https://www.youtube.com/watch?v=abcdefghijk&list=playlist&si=tracking'),
    '曲名 https://youtu.be/abcdefghijk @YouTubeより',
  );
});

test('共有文を128文字以内に収める', () => {
  const result = createShareText('あ'.repeat(150), 'https://www.youtube.com/watch?v=abcdefghijk');
  assert.ok(result);
  assert.equal([...result].length, 128);
  assert.match(result, /\.\.\. https:\/\/youtu\.be\/abcdefghijk @YouTubeより$/);
});

test('動画以外のページは共有文を作らない', () => {
  assert.equal(createShareText('title', 'https://www.youtube.com/playlist?list=abc'), null);
});
