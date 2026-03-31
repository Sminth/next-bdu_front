/**
 * Classe de base générique pour implémenter le pattern Singleton.
 * Permet de créer facilement des services singleton sans réécrire la logique getInstance.
 */
export abstract class Singleton<T> {
  private static instances: Map<any, any> = new Map();

  /**
   * Retourne l'instance unique de la classe.
   * Crée l'instance si elle n'existe pas encore.
   *
   * @returns L'instance unique de la classe
   */
  public static getInstance<T extends Singleton<any>>(this: new () => T): T {
    if (!Singleton.instances.has(this)) {
      Singleton.instances.set(this, new this());
    }
    return Singleton.instances.get(this);
  }
}
