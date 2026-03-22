import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

const resolver = new Resolver();

resolver.define('getText', (req) => {
    console.log(req);

    return 'Hello world!';
});

resolver.define('getProjects', async (req) => {
    console.log('Fetching all projects...');

    try {
        const allProjects = [];
        let startAt = 0;
        const maxResults = 100;

        while (true) {
            const response = await api.asApp().requestJira(route`/rest/api/3/project/search?startAt=${startAt}&maxResults=${maxResults}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            const values = Array.isArray(data.values) ? data.values : [];
            allProjects.push(...values);

            const nextStartAt = data.startAt + data.maxResults;
            if (nextStartAt >= data.total) {
                break;
            }
            startAt = nextStartAt;
        }

        return { values: allProjects };
    } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
    }
});

export const handler = resolver.getDefinitions();

