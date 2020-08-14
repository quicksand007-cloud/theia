/********************************************************************************
 * Copyright (C) 2018 Red Hat, Inc. and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

/* eslint-disable @typescript-eslint/no-explicit-any */

import { PluginDeployerResolver, PluginDeployerResolverContext } from '../../../common/plugin-protocol';
import { injectable } from 'inversify';
import * as fs from 'fs';
import * as path from 'path';
import { FileUri } from '@theia/core/lib/node';
import URI from '@theia/core/lib/common/uri';

@injectable()
export class LocalDirectoryPluginDeployerResolver implements PluginDeployerResolver {

    static LOCAL_DIR = 'local-dir';

    /**
     * Check all files/folder from the local-dir referenced and add them as plugins.
     */
    async resolve(pluginResolverContext: PluginDeployerResolverContext): Promise<void> {
        // get directory
        const localDirUri = new URI(pluginResolverContext.getOriginId());
        if (localDirUri.scheme !== LocalDirectoryPluginDeployerResolver.LOCAL_DIR) {
            return;
        }
        // get fs path
        let dirPath = FileUri.fsPath(localDirUri);
        if (!path.isAbsolute(dirPath)) {
            dirPath = path.resolve(process.cwd(), dirPath);
        }
        // check directory exists
        if (!fs.existsSync(dirPath)) {
            console.warn(`The directory referenced by ${pluginResolverContext.getOriginId()} does not exist.`);
            return;
        }
        // list all stuff from this directory
        await new Promise((resolve: any, reject: any) => {
            fs.readdir(dirPath, (err: any, files: any) => {
                files.forEach((file: any) => {
                    pluginResolverContext.addPlugin(file, path.resolve(dirPath, file));
                });
                resolve(true);
            });
        });
    }
    accept(pluginId: string): boolean {
        return pluginId.startsWith(LocalDirectoryPluginDeployerResolver.LOCAL_DIR);
    }
}
