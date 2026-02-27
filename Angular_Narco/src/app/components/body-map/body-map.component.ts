import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Article } from '../../models/article.model';
import { BodyPart } from '../../models/body-part.model';

@Component({
  selector: 'app-body-map',
  templateUrl: './body-map.component.html',
  styleUrls: ['./body-map.component.css']
})
export class BodyMapComponent implements OnInit {
  bodyParts: BodyPart[] = [];
  articles: Article[] = [];
  selectedBodyPart: BodyPart | null = null;
  hoveredBodyPart: string | null = null;

  private bodyPartMapping: { [key: string]: string[] } = {
    'tête': ['tête', 'tete', 'head', 'crane', 'crâne', 'cerveau'],
    'cou': ['cou', 'neck'],
    'épaule': ['épaule', 'epaule', 'shoulder', 'épaules', 'epaules'],
    'torse': ['torse', 'torso', 'chest', 'poitrine', 'thorax'],
    'bras': ['bras', 'arm', 'arms'],
    'coude': ['coude', 'elbow'],
    'avant-bras': ['avant-bras', 'avant bras', 'forearm'],
    'main': ['main', 'hand', 'mains', 'hands'],
    'abdomen': ['abdomen', 'ventre', 'belly'],
    'bassin': ['bassin', 'pelvis', 'hanche', 'hanches'],
    'cuisse': ['cuisse', 'thigh', 'cuisses', 'jambe superieure'],
    'genou': ['genou', 'knee', 'genoux'],
    'jambe': ['jambe', 'leg', 'jambes', 'mollet'],
    'pied': ['pied', 'foot', 'pieds', 'feet'],
    'colonne vertébrale': ['colonne vertébrale', 'colonne vertebrale', 'spine', 'dos', 'vertebre', 'vertèbre']
  };

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadBodyParts();
  }

  loadBodyParts(): void {
    console.log('🔄 Chargement des parties du corps...');
    this.apiService.getAllBodyParts().subscribe({
      next: (data) => {
        this.bodyParts = data;
        console.log('✅ Parties du corps chargées:', data);
        console.log('📋 Liste des parties disponibles:');
        data.forEach(bp => {
          console.log(`  - ID: ${bp.id}, Nom: ${bp.nameBodyPart || bp.name || 'N/A'}`);
        });
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des parties du corps:', error);
        alert('Erreur: Impossible de charger les parties du corps. Vérifiez que le serveur backend est démarré.');
      }
    });
  }

  onBodyPartClick(bodyPartName: string): void {
    console.log(`🖱️ Clic sur: "${bodyPartName}"`);

    const bodyPart = this.findBodyPart(bodyPartName);

    if (bodyPart && bodyPart.id) {
      console.log(`✅ Partie trouvée:`, bodyPart);
      this.selectedBodyPart = bodyPart;
      this.loadArticlesForBodyPart(bodyPart.id);
    } else {
      console.warn(`⚠️ Partie du corps non trouvée: "${bodyPartName}"`);
      console.log('💡 Parties disponibles dans la base:');
      this.bodyParts.forEach(bp => {
        console.log(`  - ${bp.nameBodyPart || bp.name || 'N/A'}`);
      });

      alert(`Aucune donnée trouvée pour "${bodyPartName}".\n\nAssurez-vous d'avoir des entrées dans la table body_part avec ce nom.`);
    }
  }

  private findBodyPart(clickedName: string): BodyPart | undefined {
    const normalizedClick = this.normalizeString(clickedName);

    const aliases = this.bodyPartMapping[clickedName.toLowerCase()] || [clickedName];

    return this.bodyParts.find(bp => {
      const dbName = this.normalizeString(bp.nameBodyPart || bp.name || '');

      if (dbName === normalizedClick) return true;

      return aliases.some(alias => {
        const normalizedAlias = this.normalizeString(alias);
        return dbName === normalizedAlias || dbName.includes(normalizedAlias) || normalizedAlias.includes(dbName);
      });
    });
  }

  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
      .trim();
  }

  isBodyPartSelected(bodyPartName: string): boolean {
    if (!this.selectedBodyPart) return false;
    const selectedName = (this.selectedBodyPart as any).name || this.selectedBodyPart.nameBodyPart || '';
    return this.normalizeString(selectedName) === this.normalizeString(bodyPartName);
  }

  loadArticlesForBodyPart(bodyPartId: number): void {
    console.log(`🔍 Chargement des articles pour la partie ID: ${bodyPartId}`);
    this.apiService.getArticlesByBodyPartId(bodyPartId).subscribe({
      next: (data) => {
        this.articles = data;
        console.log(`✅ ${data.length} article(s) chargé(s):`, data);

        if (data.length === 0) {
          console.warn('⚠️ Aucun article trouvé pour cette partie du corps');
          alert(`Aucun article disponible pour cette partie du corps.\n\nAjoutez des articles dans la table "article" avec id_body_part = ${bodyPartId}`);
        }
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des articles:', error);
        this.articles = [];
        alert('Erreur lors du chargement des articles. Vérifiez les logs de la console.');
      }
    });
  }

  onBodyPartHover(bodyPartName: string): void {
    this.hoveredBodyPart = bodyPartName;
  }

  onBodyPartLeave(): void {
    this.hoveredBodyPart = null;
  }

  closeArticlesList(): void {
    console.log('❌ Fermeture du panneau des articles');
    this.selectedBodyPart = null;
    this.articles = [];
  }
}
