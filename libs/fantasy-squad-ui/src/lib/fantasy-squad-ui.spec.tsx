import { render } from '@testing-library/react';

import FantasySquadUi from './fantasy-squad-ui';

describe('FantasySquadUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FantasySquadUi />);
    expect(baseElement).toBeTruthy();
  });
});
