import { v1 as uuid } from "uuid";

import { ArticleLanguage } from "../../../../server/api/article/model/article-language";
import { apiClient } from "../../core/api-client";
import { storageService } from "../../core/storage-client";
import { initialState } from "./draft.initialState";
import {
  DraftActions,
  DraftState,
  IArticle,
  IDraft,
  StateUpdateFunction,
} from "./types";
import { errorHandlerService } from "../../core/error-handler-service";
import { slugify } from "../../shared/slugify";

export const draft = {
  initialState: (): DraftState => ({ ...initialState() }),
  actions: (update: flyd.Stream<StateUpdateFunction>): DraftActions => ({
    reset() {
      update(() => ({ ...initialState() }));
    },
    setId(id: string) {
      update((state: DraftState) => {
        state.id = id;
        return state;
      });
    },
    fetch(id: string): Promise<IArticle> {
      return new Promise((resolve, reject) => {
        apiClient
          .get<IArticle>(`/api/v1/article/${id}`)
          .then(article => {
            update((state: DraftState) => {
              state.draft = article;
              state.draftLoaded = true;
              return state;
            });
            resolve(article);
          })
          .catch(err => {
            update((state: DraftState) => {
              state.error = err;
              return state;
            });
            reject(err);
          });
      });
    },
    initEditor(element: HTMLTextAreaElement, initialValue: string) {
      import(/* webpackChunkName: "app-admin" */ "simplemde")
        .then(SimpleMDE => {
          update((state: DraftState) => {
            state.editor = new SimpleMDE.default({
              element,
              initialValue,
              lineWrapping: true,
              spellChecker:
                state.draft.lang === ArticleLanguage.EN ? true : false,
              autoDownloadFontAwesome: true,
              forceSync: false,
              tabSize: 2,
              autosave: {
                enabled: false,
                uniqueId: "editor",
              },
              autofocus: true,
            });
            return state;
          });
        })
        .catch(err => errorHandlerService.throw(err));
    },
    publish() {
      update((state: DraftState) => {
        state.draft.published = true;
        state.draft.publishedAt = new Date().toString();
        return state;
      });
    },
    dePublish() {
      update((state: DraftState) => {
        state.draft.published = false;
        state.draft.publishedAt = null;
        return state;
      });
    },
    update(id: string, draft: IArticle): Promise<IArticle> {
      update((state: DraftState) => {
        state.loading = true;
        return state;
      });

      return new Promise((resolve, reject) => {
        apiClient
          .put<IArticle>(`/api/v1/article/${id}`, draft)
          .then(updatedDraft => {
            update((state: DraftState) => {
              state.loading = false;
              return state;
            });
            resolve(updatedDraft);
          })
          .catch(err => {
            update((state: DraftState) => {
              state.error = err;
              state.loading = false;
              return state;
            });
            reject(err);
          });
      });
    },
    post(draft: IDraft): Promise<IArticle> {
      return new Promise((resolve, reject) => {
        apiClient
          .post<IArticle>(`/api/v1/article`, draft)
          .then(postedDraft => {
            update((state: DraftState) => {
              state.draft = postedDraft;
              return state;
            });
            resolve(postedDraft);
          })
          .catch(err => {
            update((state: DraftState) => {
              state.error = err;
              return state;
            });
            reject(err);
          });
      });
    },
    uploadPoster(id: string, file: File) {
      return new Promise((resolve, reject) => {
        const filename = id || "draft" + "-" + uuid();
        storageService
          .upload(filename, file)
          .then(response => {
            const { path } = response;
            update((state: DraftState) => {
              state.draft.posterUrl = path;
              return state;
            });
            resolve();
          })
          .catch(err => {
            update((state: DraftState) => {
              state.error = err;
              return state;
            });
            reject(err);
          });
      });
    },
    editTitle(title: string) {
      update((state: DraftState) => {
        state.draft.title = title;
        return state;
      });
    },
    editSlug(slug: string) {
      update((state: DraftState) => {
        state.draft.slug = slugify(slug);
        return state;
      });
    },
    editMetaTitle(metaTitle: string) {
      update((state: DraftState) => {
        state.draft.metaTitle = metaTitle;
        return state;
      });
    },
    editMetaDescription(metaDescription: string) {
      update((state: DraftState) => {
        state.draft.metaDescription = metaDescription;
        return state;
      });
    },
    editTags(tags: string) {
      update((state: DraftState) => {
        state.draft.tags = tags.split(",");
        return state;
      });
    },
    editLang(lang: ArticleLanguage) {
      update((state: DraftState) => {
        state.draft.lang = lang;
        return state;
      });
    },
    removePoster() {
      update((state: DraftState) => {
        // @todo remove remote poster
        state.draft.posterUrl = null;
        return state;
      });
    },
    transformMarkdownToHtml() {
      import(/* webpackChunkName: "app-admin" */ "showdown")
        .then(showdown => {
          const converter = new showdown.Converter();
          update(state => {
            const markdown = state.editor!.value();
            const html = converter.makeHtml(markdown);
            state.draft.html = html;
            state.draft.markdown = markdown;
            return state;
          });
        })
        .catch(err => errorHandlerService.throw(err));
    },
  }),
};