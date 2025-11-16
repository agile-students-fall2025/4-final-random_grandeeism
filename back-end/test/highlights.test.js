const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const highlightsRouter = require('../routes/highlights');
const daoFactory = require('../lib/daoFactory');

const { expect } = chai;
chai.use(chaiHttp);

describe('Highlights - helpers', () => {
	// Reset mock data before each test to ensure isolation
	beforeEach(() => {
		daoFactory.resetMockData();
	});

	const { generateTitle, validateAnnotationsPayload, buildNewHighlight, buildUpdatedHighlight } = highlightsRouter._helpers;

	it('generateTitle returns short preview (<=6 words) and adds ellipses when trimmed', () => {
		const long = 'This is a very long highlighted sentence that should be trimmed for title generation';
		const title = generateTitle(long);
		expect(title).to.be.a('string');
		// should contain at most 6 words
		expect(title.split(/\s+/).length).to.be.at.most(7); // allows trailing '...'
		expect(title).to.match(/\.\.\.$|\w/);
	});

		it('generateTitle edge-case: short text returns full text (no ellipses)', () => {
			const short = 'Short title here';
			const title = generateTitle(short);
			expect(title).to.equal(short);
		});

		it('generateTitle invalid input: null/undefined -> empty string', () => {
			expect(generateTitle(null)).to.equal('');
			expect(generateTitle(undefined)).to.equal('');
		});

	it('validateAnnotationsPayload accepts undefined, null, and object; rejects arrays and non-objects', () => {
		expect(validateAnnotationsPayload(undefined).valid).to.be.true;
		expect(validateAnnotationsPayload(null).valid).to.be.true;
		expect(validateAnnotationsPayload({ title: 'a' }).valid).to.be.true;
		expect(validateAnnotationsPayload([]).valid).to.be.false;
		expect(validateAnnotationsPayload('string').valid).to.be.false;
	});

		it('validateAnnotationsPayload edge: object with extra keys is allowed', () => {
			const res = validateAnnotationsPayload({ title: 't', extra: 123 });
			expect(res.valid).to.be.true;
		});

		it('validateAnnotationsPayload invalid: numeric or boolean are rejected', () => {
			expect(validateAnnotationsPayload(123).valid).to.be.false;
			expect(validateAnnotationsPayload(true).valid).to.be.false;
		});

	it('buildNewHighlight builds expected shape and generates title when missing', () => {
		const nh = buildNewHighlight({
			articleId: '1',
			userId: 'user-test',
			text: 'Example highlighted text for tests',
			color: '#fff',
			position: { start: 1, end: 5 },
			annotations: undefined
		});
		// Note: buildNewHighlight no longer generates ID - that's done by the DAO
		expect(nh).to.include.keys('articleId', 'userId', 'text', 'annotations', 'createdAt', 'position', 'color');
		expect(nh.annotations).to.have.property('title').that.is.a('string');
	});

		it('buildNewHighlight valid: uses provided annotation title when present', () => {
			const nh = buildNewHighlight({
				articleId: '2',
				userId: 'u2',
				text: 'Some text',
				color: '#000',
				position: { start: 0, end: 4 },
				annotations: { title: 'Provided', note: 'n' }
			});
			expect(nh.annotations.title).to.equal('Provided');
		});

		it('buildNewHighlight edge: empty annotation title falls back to generated title', () => {
			const nh = buildNewHighlight({
				articleId: '3',
				userId: 'u3',
				text: 'Some unique text for generation',
				color: '#000',
				position: { start: 0, end: 4 },
				annotations: { title: '', note: '' }
			});
			expect(nh.annotations.title).to.be.a('string');
			expect(nh.annotations.title).to.not.equal('');
		});

	it('buildUpdatedHighlight rejects text changes and validates annotations', () => {
		const mock = {
			id: 'highlight-1',
			articleId: '3',
			userId: 'user-1',
			text: 'Original text',
			annotations: { title: 'T', note: 'N' }
		};
		const attempt = buildUpdatedHighlight(mock, { text: 'Different' });
		expect(attempt.error).to.exist;
		const badAnn = buildUpdatedHighlight(mock, { annotations: [] });
		expect(badAnn.error).to.exist;
		const ok = buildUpdatedHighlight(mock, { annotations: { title: 'New' } });
		expect(ok.updated).to.exist;
		expect(ok.updated.annotations.title).to.equal('New');
	});

		it('buildUpdatedHighlight valid: annotations:null removes annotations', () => {
			const mock = { id: 'h1', articleId: 'a', userId: 'u', text: 'x', annotations: { title: 't' } };
			const res = buildUpdatedHighlight(mock, { annotations: null });
			expect(res.updated.annotations).to.equal(null);
		});

		it('buildUpdatedHighlight edge: updating only note keeps title unchanged', () => {
			const mock = { id: 'h2', articleId: 'a', userId: 'u', text: 'x', annotations: { title: 't', note: 'n' } };
			const res = buildUpdatedHighlight(mock, { annotations: { note: 'new note' } });
			expect(res.updated.annotations.title).to.equal('t');
			expect(res.updated.annotations.note).to.equal('new note');
		});

		it('buildUpdatedHighlight invalid: annotations array rejected', () => {
			const mock = { id: 'h3', articleId: 'a', userId: 'u', text: 'x', annotations: { title: 't' } };
			const res = buildUpdatedHighlight(mock, { annotations: [] });
			expect(res.error).to.exist;
		});
});

describe('Highlights - routes (integration)', () => {
	it('POST /api/highlights - missing required fields returns 400', done => {
		chai.request(app)
			.post('/api/highlights')
			.send({})
			.end((err, res) => {
				expect(res).to.have.status(400);
				done();
			});
	});

	it('POST /api/highlights - valid request returns 201 and includes annotations and text', done => {
		const payload = {
			articleId: '1',
			userId: 'user-1',
			text: 'Some highlighted text to create',
			position: { start: 10, end: 20 }
		};
		chai.request(app)
			.post('/api/highlights')
			.send(payload)
			.end((err, res) => {
				expect(res).to.have.status(201);
				expect(res.body).to.have.property('data');
				expect(res.body.data).to.include.keys('text', 'annotations');
				done();
			});
	});

		it('POST /api/highlights - edge: annotations with empty title falls back to generated title', done => {
			const payload = {
				articleId: '1',
				userId: 'user-1',
				text: 'Some highlighted text to create for edge',
				position: { start: 10, end: 20 },
				annotations: { title: '', note: '' }
			};
			chai.request(app)
				.post('/api/highlights')
				.send(payload)
				.end((err, res) => {
					expect(res).to.have.status(201);
					expect(res.body.data.annotations.title).to.be.a('string').and.to.not.equal('');
					done();
				});
		});

		it('POST /api/highlights - invalid: annotations array returns 400', done => {
			const payload = {
				articleId: '1',
				userId: 'user-1',
				text: 'text',
				position: { start: 1, end: 2 },
				annotations: []
			};
			chai.request(app)
				.post('/api/highlights')
				.send(payload)
				.end((err, res) => {
					expect(res).to.have.status(400);
					done();
				});
		});

	it('PUT /api/highlights/:id - cannot change text (400)', done => {
		chai.request(app)
			.put('/api/highlights/1')
			.send({ text: 'I should not be allowed' })
			.end((err, res) => {
				expect(res).to.have.status(400);
				done();
			});
	});

	it('PUT /api/highlights/:id - annotations:null removes annotations', done => {
		chai.request(app)
			.put('/api/highlights/1')
			.send({ annotations: null })
			.end((err, res) => {
				expect(res).to.have.status(200);
				expect(res.body.data).to.have.property('annotations').that.is.null;
				done();
			});
	});

		it('PUT /api/highlights/:id - valid: update title only', done => {
			chai.request(app)
				.put('/api/highlights/1')
				.send({ annotations: { title: 'Updated Title' } })
				.end((err, res) => {
					expect(res).to.have.status(200);
					expect(res.body.data.annotations.title).to.equal('Updated Title');
					done();
				});
		});

		it('PUT /api/highlights/:id - edge: empty title/note updates to empty strings (no delete)', done => {
			chai.request(app)
				.put('/api/highlights/1')
				.send({ annotations: { title: '', note: '' } })
				.end((err, res) => {
					expect(res).to.have.status(200);
					expect(res.body.data.annotations.title).to.equal('');
					expect(res.body.data.annotations.note).to.equal('');
					done();
				});
		});

		it('PUT /api/highlights/:id - invalid: annotations array returns 400', done => {
			chai.request(app)
				.put('/api/highlights/1')
				.send({ annotations: [] })
				.end((err, res) => {
					expect(res).to.have.status(400);
					done();
				});
		});

});

