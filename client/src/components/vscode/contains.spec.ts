import { contains } from './contains';

describe('contains', () => {
  describe('does contain', () => {
    it('exactly', () => {
      expect(contains({
        start: {
          line: 0,
          character: 0
        },
        end: {
          line: 0,
          character: 1
        },
      }, {
        line: 0,
        character: 1
      })).toEqual(true);
    });

    it('exactly end', () => {
      expect(contains({
        start: {
          line: 0,
          character: 0
        },
        end: {
          line: 0,
          character: 10
        },
      }, {
        line: 0,
        character: 10
      })).toEqual(true);
    });

    it('exactly start', () => {
      expect(contains({
        start: {
          line: 0,
          character: 0
        },
        end: {
          line: 0,
          character: 10
        },
      }, {
        line: 0,
        character: 0
      })).toEqual(true);
    });

    it('within start and end', () => {
      expect(contains({
        start: {
          line: 0,
          character: 0
        },
        end: {
          line: 0,
          character: 10
        },
      }, {
        line: 0,
        character: 5
      })).toEqual(true);
    });
  });

  it('is before range', () => {
    expect(contains({
      start: {
        line: 0,
        character: 5
      },
      end: {
        line: 0,
        character: 10
      },
    }, {
      line: 0,
      character: 0
    })).toEqual(false);
  });

  it('is after range', () => {
    expect(contains({
      start: {
        line: 0,
        character: 0
      },
      end: {
        line: 0,
        character: 5
      },
    }, {
      line: 0,
      character: 10
    })).toEqual(false);
  });
});