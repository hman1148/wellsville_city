import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { blankAppGenerator } from './blank-app';
import { BlankAppGeneratorSchema } from './schema';

describe('blank-app generator', () => {
  let tree: Tree;
  const options: BlankAppGeneratorSchema = { appSubDirectory: 'subdir/foo/bar' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await blankAppGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'subdir-foo-bar');
    expect(config).toBeDefined();
  });
});
